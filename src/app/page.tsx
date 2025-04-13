'use client';

import Image from 'next/image';
import Link from 'next/link';

import { knots } from '@/constant/knots';

// !STARTERCONF -> Select !STARTERCONF and CMD + SHIFT + F
// Before you begin editing, follow all comments with `STARTERCONF`,
// to customize the default configuration.

export default function Home() {
  return (
    <main className='container mx-auto px-4 py-8'>
      <h1 className='text-4xl font-bold mb-8'>Knot Tying Tutorials</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {knots.map((knot) => (
          <Link
            key={knot.id}
            href={`/tutorial/${knot.id}`}
            className='block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow'
          >
            <div className='aspect-video bg-gray-200 rounded-md mb-4 relative overflow-hidden'>
              <Image
                src={knot.imageUrl}
                alt={knot.name}
                fill
                className='object-cover'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              />
            </div>
            <h2 className='text-xl font-semibold mb-2'>{knot.name}</h2>
            <p className='text-gray-600'>{knot.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
