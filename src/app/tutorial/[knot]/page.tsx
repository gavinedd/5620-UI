'use client';

import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaCheck } from 'react-icons/fa';

import KnotStepInstructions from '@/components/KnotStepInstructions';

import { knots } from '@/constant/knots';

interface TutorialPageProps {
  params: {
    knot: string;
  };
}

export default function TutorialPage({ params }: TutorialPageProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [currentStage, setCurrentStage] = useState<string>('loose_rope');
  const knot = knots.find((k) => k.id === params.knot);

  if (!knot) {
    notFound();
  }

  // Handle stage completion
  const handleStageComplete = (stage: string) => {
    // Only add to completed stages if not already completed
    if (!completedStages.includes(stage)) {
      setCompletedStages((prev) => [...prev, stage]);

      // Get all stages to determine next stage
      const allStages = getAllStages();
      const currentIndex = allStages.findIndex((s) => s.id === stage);

      // If there's a next stage, set it as current
      if (currentIndex < allStages.length - 1) {
        setCurrentStage(allStages[currentIndex + 1].id);
      }
    }
  };

  // Function to switch models based on the selected knot
  const switchModel = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/reload_model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_path: `models/${knot.id === 'half-knot' ? 'square_knot' : knot.id}/best_model.pth`,
          knot_def_path: `knot_definitions/${knot.id === 'half-knot' ? 'square_knot' : knot.id}.knot`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to switch models');
      }

      setError(null);
    } catch (err) {
      console.error('Error switching models:', err);
      setError(
        'Error switching classification models. Please ensure the server is running.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Switch model when the knot changes
  useEffect(() => {
    switchModel();
  }, [params.knot]);

  // Get all stages in order
  const getAllStages = () => {
    if (knot.id === 'half-knot') {
      return [
        {
          id: 'loose_rope',
          name: 'Loose Rope',
          description: 'Begin with two loose rope ends',
        },
        {
          id: 'left_over_right',
          name: 'Left Over Right',
          description: 'Cross the left rope over the right',
        },
        {
          id: 'tuck_under',
          name: 'Tuck Under',
          description: 'Tuck the left rope under the right',
        },
        {
          id: 'first_half_complete',
          name: 'Complete',
          description: 'Pull both ends to tighten',
        },
      ];
    } else if (knot.id === 'square-knot') {
      return [
        {
          id: 'loose_rope',
          name: 'Loose Rope',
          description: 'Begin with two loose rope ends',
        },
        {
          id: 'left_over_right',
          name: 'First Half - Left Over Right',
          description: 'Cross the left rope over the right',
        },
        {
          id: 'tuck_under',
          name: 'First Half - Tuck Under',
          description: 'Tuck the left rope under the right',
        },
        {
          id: 'first_half_complete',
          name: 'First Half Complete',
          description: 'Pull both ends to tighten',
        },
        {
          id: 'right_over_left',
          name: 'Second Half - Right Over Left',
          description: 'Cross the right rope over the left',
        },
        {
          id: 'tuck_under_second',
          name: 'Second Half - Tuck Under',
          description: 'Tuck the right rope under the left',
        },
        {
          id: 'square_knot_complete',
          name: 'Complete',
          description: 'Pull both ends to tighten',
        },
      ];
    }
    return [];
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Left side - Video stream and instructions */}
        <div className='flex-1'>
          <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
            <h1 className='text-3xl font-bold mb-4'>{knot.name}</h1>
            <p className='text-gray-600 mb-6'>{knot.description}</p>

            {/* Video stream */}
            <div className='relative w-full mb-6'>
              <div className='w-full h-[480px] bg-gray-100 rounded-lg overflow-hidden'>
                <img
                  src='http://localhost:8000/stream'
                  alt='Video Stream'
                  className='w-full h-full object-contain'
                  onError={(e) => {
                    console.error('Stream error:', e);
                    setError(
                      'Error loading stream. Please check if the stream server is running.',
                    );
                  }}
                />
                {error && (
                  <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white p-4'>
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Step instructions */}
            <KnotStepInstructions
              knotId={params.knot}
              onStageChange={(stage) => setCurrentStage(stage)}
              onStageComplete={handleStageComplete}
              currentStage={currentStage}
              completedStages={completedStages}
            />
          </div>
        </div>

        {/* Right side - Steps list */}
        <div className='lg:w-80'>
          <div className='bg-white rounded-lg shadow-md p-6 sticky top-8'>
            <h3 className='text-lg font-semibold mb-4'>Steps</h3>
            <div className='space-y-3'>
              {getAllStages().map((stage, index) => {
                const isCompleted = completedStages.includes(stage.id);
                const isCurrent = currentStage === stage.id;

                return (
                  <div
                    key={stage.id}
                    className={`p-3 rounded-lg border ${
                      isCompleted
                        ? 'border-green-500 bg-green-50'
                        : isCurrent
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                    }`}
                  >
                    <div className='flex items-center'>
                      <div
                        className={`w-6 h-6 flex items-center justify-center rounded-full mr-2 ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200'
                        }`}
                      >
                        {isCompleted ? (
                          <FaCheck size={12} />
                        ) : (
                          <span className='text-xs'>{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <h4
                          className={`font-medium ${
                            isCompleted
                              ? 'text-green-700'
                              : isCurrent
                                ? 'text-blue-700'
                                : 'text-gray-700'
                          }`}
                        >
                          {stage.name}
                        </h4>
                        <p className='text-sm text-gray-600'>
                          {stage.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
