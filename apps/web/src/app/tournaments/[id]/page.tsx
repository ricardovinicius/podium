'use client';

import { useQuery } from '@tanstack/react-query';
import { useConnection, useWriteContract, usePublicClient } from 'wagmi';
import { TournamentABI } from '@podium/sdk';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

const getApiBase = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

export default function TournamentDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { address } = useConnection();
  const { writeContract } = useWriteContract();
  const publicClient = usePublicClient();
  const [verdictError, setVerdictError] = useState<string | null>(null);
  const [verdictLoading, setVerdictLoading] = useState<number | null>(null);

  const apiBase = getApiBase();

  const { data: tournament, refetch: refetchT } = useQuery({
    queryKey: ['tournament', id],
    queryFn: async () => {
      const res = await fetch(`${apiBase}/tournaments/${id}`);
      if (!res.ok) throw new Error('Not found');
      return res.json();
    },
    enabled: !!id,
  });

  const { data: matches, refetch: refetchM } = useQuery({
    queryKey: ['matches', id],
    queryFn: async () => (await fetch(`${apiBase}/tournaments/${id}/matches`)).json(),
    enabled: !!id,
  });

  const { data: participants } = useQuery({
    queryKey: ['participants', id],
    queryFn: async () => (await fetch(`${apiBase}/tournaments/${id}/participants`)).json(),
    enabled: !!id,
  });

  useEffect(() => {
    if (!id) return;
    const evtSource = new EventSource(`${apiBase}/tournaments/${id}/events`);
    evtSource.onmessage = () => {
      refetchT();
      refetchM();
    };
    evtSource.onerror = (error) => {
      console.error("SSE error:", error);
    };
    return () => evtSource.close();
  }, [id, refetchT, refetchM, apiBase]);

  // Map Solidity revert reasons to user-friendly messages
  const getReadableError = (errorMsg: string): string => {
    if (errorMsg.includes('Not a judge')) return 'Your wallet is not registered as a judge for this tournament.';
    if (errorMsg.includes('Invalid winner')) return 'The address you entered is not a valid participant in this match.';
    if (errorMsg.includes('Child matches not resolved')) return 'This match cannot be judged yet — the previous round matches are not resolved.';
    if (errorMsg.includes('Already voted')) return 'You have already submitted a verdict for this match.';
    if (errorMsg.includes('Match already finalized')) return 'This match has already been finalized.';
    if (errorMsg.includes('Tournament completed')) return 'This tournament has already been completed.';
    if (errorMsg.includes('Tournament does not exist')) return 'This tournament does not exist on-chain.';
    if (errorMsg.includes('Not an internal node')) return 'Invalid match index — this is not a judgeable match.';
    if (errorMsg.includes('Judges disagree')) return 'Your chosen winner conflicts with other judges\' votes. Consensus cannot be reached.';
    return errorMsg;
  };

  const submitVerdict = async (matchIndex: number) => {
    const winnerWallet = (document.getElementById(`winner-${matchIndex}`) as HTMLInputElement).value;
    if (!winnerWallet) return alert("Please enter winner wallet");
    if (tournament?.onchainId === undefined || tournament?.onchainId === null) return alert('Tournament not linked on-chain yet.');
    if (!address) return alert('Please connect your wallet first.');

    setVerdictError(null);
    setVerdictLoading(matchIndex);

    try {
      // Simulate the contract call first to catch revert reasons
      await publicClient!.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: TournamentABI,
        functionName: 'submitVerdict',
        args: [BigInt(tournament.onchainId), BigInt(matchIndex), winnerWallet as `0x${string}`],
        account: address,
      });

      // Simulation passed — now send the real transaction
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: TournamentABI,
        functionName: 'submitVerdict',
        args: [BigInt(tournament.onchainId), BigInt(matchIndex), winnerWallet as `0x${string}`],
      });
      alert('Verdict transaction sent! Waiting for confirmation and indexer...');
    } catch (e: any) {
      const msg = e?.cause?.reason || e?.cause?.message || e?.shortMessage || e?.message || 'Unknown error';
      const readable = getReadableError(msg);
      setVerdictError(readable);
    } finally {
      setVerdictLoading(null);
    }
  };

  if (!tournament || !matches) return <div className="p-8 text-center">Loading...</div>;

  return (
    <main className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-gray-900">{tournament.name}</h1>
        <div className="flex gap-4 items-center mt-4">
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">Status: {tournament.status}</span>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">Prize: {tournament.prize} wei</span>
          {tournament.onchainId !== null && (
            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">OnChain ID: {tournament.onchainId}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Matches</h2>
          <div className="grid gap-4">
            {matches.sort((a: any, b: any) => b.matchIndex - a.matchIndex).map((m: any) => (
              <div key={m.id} className="border border-gray-200 p-6 rounded-xl bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition">
                <div>
                  <h3 className="font-bold text-xl text-gray-900">Match Node: {m.matchIndex}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${m.isFinalized ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <p className="text-sm font-medium text-gray-600">
                      {m.isFinalized ? `Winner: ${m.winner}` : 'Pending Verdicts'}
                    </p>
                  </div>
                </div>

                {!m.isFinalized && tournament.status === 'InProgress' && address && (
                  <div className="mt-4 md:mt-0">
                    <div className="flex gap-3 items-center">
                      <input
                        type="text"
                        placeholder="Winner Wallet 0x..."
                        className="border border-gray-300 p-2.5 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id={`winner-${m.matchIndex}`}
                        disabled={verdictLoading === m.matchIndex}
                      />
                      <button
                        onClick={() => submitVerdict(m.matchIndex)}
                        disabled={verdictLoading === m.matchIndex}
                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${verdictLoading === m.matchIndex
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-black text-white hover:bg-gray-800'
                          }`}
                      >
                        {verdictLoading === m.matchIndex ? 'Validating...' : 'Judge'}
                      </button>
                    </div>
                    {verdictError && verdictLoading === null && (
                      <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                        {verdictError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
            {matches.length === 0 && (
              <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-500 font-medium">No matches active yet.</p>
                <p className="text-sm text-gray-400 mt-1">Wait for the tournament to start.</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Participants</h2>
            <ul className="space-y-2">
              {participants?.map((p: any) => (
                <li key={p.id} className="font-mono text-xs text-gray-600 bg-white p-3 rounded border border-gray-100 shadow-sm overflow-hidden text-ellipsis">
                  {p.wallet}
                </li>
              ))}
              {participants?.length === 0 && <p className="text-sm text-gray-500">None registered</p>}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
