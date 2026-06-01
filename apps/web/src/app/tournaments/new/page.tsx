'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { useRouter } from 'next/navigation';
import { TournamentABI } from '@podium/sdk';
import { parseEther, parseEventLogs } from 'viem';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

const getApiBase = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

export default function CreateTournamentPage() {
  const router = useRouter();
  const apiBase = getApiBase();
  const [name, setName] = useState('');
  const [prizeStr, setPrizeStr] = useState('0');
  const [participantsStr, setParticipantsStr] = useState('');
  const [judgesStr, setJudgesStr] = useState('');
  const [status, setStatus] = useState('');

  const { data: hash, writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const publicClient = usePublicClient();

  const handleDeploy = async () => {
    try {
      if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS.toString() === 'undefined') {
        throw new Error('Contract address not found in environment variables (NEXT_PUBLIC_CONTRACT_ADDRESS).');
      }
      setStatus('Creating tournament in database...');
      const participants = participantsStr.split('\n').map(p => p.trim()).filter(Boolean);
      const judges = judgesStr.split('\n').map(j => j.trim()).filter(Boolean) as `0x${string}`[];
      const prize = parseEther(prizeStr).toString();

      // 1. Create DB tournament
      const tRes = await fetch(`${apiBase}/tournaments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, prize })
      });
      const t = await tRes.json();
      const dbId = t.id;

      // 2. Add participants
      for (const p of participants) {
        await fetch(`${apiBase}/tournaments/${dbId}/participants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet: p })
        });
      }

      // 3. Add judges
      for (const j of judges) {
        await fetch(`${apiBase}/tournaments/${dbId}/judges`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet: j })
        });
      }

      // 4. Get Bracket
      const bRes = await fetch(`${apiBase}/tournaments/${dbId}/bracket`);
      const bData = await bRes.json();
      
      if (bData.error || !bData.bracket) {
        throw new Error(`Bracket Generation Failed: ${bData.error || 'Unknown error'}`);
      }
      if (judges.length === 0) {
        throw new Error('You must provide at least one judge.');
      }
      
      const bracket = bData.bracket;

      setStatus('Deploying to blockchain...');
      // 5. Call Smart Contract
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: TournamentABI,
        functionName: 'createTournament',
        args: [bracket as `0x${string}`[], judges],
        value: parseEther(prizeStr)
      });

      setStatus(`Transaction sent: ${txHash}. Waiting for confirmation...`);
      
      const receipt = await publicClient!.waitForTransactionReceipt({ hash: txHash });
      
      const logs = parseEventLogs({ 
        abi: TournamentABI, 
        eventName: 'TournamentCreated',
        logs: receipt.logs
      });
      
      if (logs.length === 0) throw new Error("Could not find TournamentCreated event");
      const onchainId = Number(logs[0].args.tournamentId);

      setStatus(`Confirmed! Linking onchain ID ${onchainId} to database...`);
      
      await fetch(`${apiBase}/tournaments/${dbId}/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onchainId, contractAddress: CONTRACT_ADDRESS })
      });

      setStatus('Successfully created and linked! Redirecting...');
      setTimeout(() => router.push(`/tournaments/${dbId}`), 1500);
      
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  };

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Tournament</h1>
      
      <div className="grid gap-6 bg-white p-6 rounded-lg shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-2">Tournament Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2 rounded" placeholder="e.g. Summer Championship" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Prize (ETH)</label>
          <input type="number" step="0.01" value={prizeStr} onChange={(e) => setPrizeStr(e.target.value)} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Participants (1 per line, must be power of 2)</label>
          <textarea value={participantsStr} onChange={(e) => setParticipantsStr(e.target.value)} className="w-full border p-2 rounded h-32" placeholder="0x123...&#10;0x456..." />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Judges (1 per line, odd number recommended)</label>
          <textarea value={judgesStr} onChange={(e) => setJudgesStr(e.target.value)} className="w-full border p-2 rounded h-32" placeholder="0x789...&#10;0xabc..." />
        </div>

        <button onClick={handleDeploy} className="bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition">
          Deploy to Contract
        </button>

        {status && <p className="text-sm text-gray-600 mt-4 p-4 bg-gray-50 rounded">{status}</p>}
        {isConfirming && <p className="text-sm text-blue-600">Waiting for confirmation...</p>}
        {isConfirmed && <p className="text-sm text-green-600">Confirmed! Please wait while we link the tournament...</p>}
      </div>
    </main>
  );
}
