'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const getApiBase = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

export default function Home() {
  const apiBase = getApiBase();
  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const res = await fetch(`${apiBase}/tournaments`);
      return res.json();
    },
  });

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Podium Referee</h1>
        <ConnectButton />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Tournaments</h2>
        <Link href="/tournaments/new" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition">
          Create Tournament
        </Link>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          tournaments?.length === 0 ? (
            <p className="text-gray-500">No tournaments found.</p>
          ) : (
            tournaments?.map((t: any) => (
              <div key={t.id} className="border p-4 rounded-lg flex justify-between items-center bg-white shadow-sm">
                <div>
                  <h3 className="text-lg font-bold">{t.name}</h3>
                  <p className="text-sm text-gray-500">Status: {t.status} | Prize: {t.prize} wei</p>
                </div>
                <Link href={`/tournaments/${t.id}`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                  View Bracket
                </Link>
              </div>
            ))
          )
        )}
      </div>
    </main>
  );
}
