'use client';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useState } from 'react';

import { knots } from '@/constant/knots';

interface TutorialPageProps {
  params: {
    knot: string;
  };
}

export default function TutorialPage({ params }: TutorialPageProps) {
  const [error, setError] = useState<string | null>(null);
  const knot = knots.find((k) => k.id === params.knot);

  if (!knot) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{knot.name}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Video Stream */}
        <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
          <img
            className="w-full h-full object-cover"
            src="http://localhost:8000/stream"
            alt="Live stream"
            onError={(e) => {
              console.error('Stream error:', e);
              setError('Error loading stream. Please check if the stream server is running.');
            }}
          />
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white p-4">
              {error}
            </div>
          )}
        </div>

        {/* Knot Diagram */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="aspect-square bg-gray-200 rounded-md mb-4 relative overflow-hidden">
            <Image
              src={knot.imageUrl}
              alt={`${knot.name} diagram`}
              fill
              className="object-contain"
            />
          </div>
          <p className="text-gray-600">{knot.description}</p>
        </div>
      </div>
    </main>
  );
} 