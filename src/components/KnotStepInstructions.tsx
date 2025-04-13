import React, { useEffect, useState } from 'react';
import { FaCheck } from 'react-icons/fa';

// Types for different knots
interface KnotStage {
  id: string;
  name: string;
  description: string;
}

interface KnotDefinition {
  id: string;
  stages: KnotStage[];
  finalStage: string;
}

// Knot definitions
const KNOT_DEFINITIONS: Record<string, KnotDefinition> = {
  'half-knot': {
    id: 'half-knot',
    stages: [
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
    ],
    finalStage: 'first_half_complete',
  },
  'square-knot': {
    id: 'square-knot',
    stages: [
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
    ],
    finalStage: 'square_knot_complete',
  },
};

interface ClassificationResponse {
  stage: string;
  confidence: number;
  timestamp: string;
  probabilities: Record<string, number>;
  sequential_bias: {
    enabled: boolean;
    strength: number;
    decay: number;
  };
  stage_info: Record<string, { name: string; description: string }>;
  stage_name: string;
}

interface KnotStepInstructionsProps {
  knotId: string;
  confidenceThreshold?: number;
  pollingInterval?: number;
  onStageChange?: (stage: string) => void;
  onStageComplete?: (stage: string) => void;
  currentStage: string;
  completedStages: string[];
}

// Stage ID mapping from API to our definitions
const STAGE_ID_MAPPING: Record<string, Record<string, string>> = {
  'half-knot': {
    loose: 'loose_rope',
    cross: 'left_over_right',
    pass_under: 'tuck_under',
    complete: 'first_half_complete',
  },
  'square-knot': {
    loose: 'loose_rope',
    cross: 'left_over_right',
    pass_under: 'tuck_under',
    complete: 'first_half_complete',
    cross_second: 'right_over_left',
    pass_under_second: 'tuck_under_second',
    complete_second: 'square_knot_complete',
  },
};

const KnotStepInstructions: React.FC<KnotStepInstructionsProps> = ({
  knotId,
  confidenceThreshold = 0.7,
  pollingInterval = 1000,
  onStageChange,
  onStageComplete,
  currentStage,
  completedStages,
}) => {
  const [classification, setClassification] =
    useState<ClassificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stageHistory, setStageHistory] = useState<
    { stage: string; timestamp: number }[]
  >([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [knotCompleted, setKnotCompleted] = useState(false);

  // Constants for stability checking
  const REQUIRED_CONSISTENT_DETECTIONS = 3; // Number of consistent detections required
  const STABILITY_WINDOW_MS = 1000; // Time window for stability check in milliseconds

  // Fetch classification data from API
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 500; // Reduced to 0.5 seconds

    const fetchClassification = async () => {
      try {
        const response = await fetch('http://localhost:8000/classification', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ClassificationResponse = await response.json();
        setClassification(data);
        setLoading(false);
        setError(null);
        retryCount = 0; // Reset retry count on successful fetch

        // Process the new classification
        processClassification(data);
      } catch (err) {
        console.error('Classification fetch error:', err);
        retryCount++;

        if (retryCount < maxRetries) {
          console.log(
            `Retrying in ${retryDelay / 1000} seconds... (Attempt ${retryCount + 1}/${maxRetries})`,
          );
          setTimeout(fetchClassification, retryDelay);
        } else {
          const errorMessage =
            err instanceof Error ? err.message : 'Unknown error occurred';
          setError(
            `Error connecting to classification API: ${errorMessage}. Please ensure the server is running and accessible.`,
          );
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchClassification();

    // Set up polling with a much faster interval
    const intervalId = setInterval(fetchClassification, 100); // Poll every 100ms (10 times per second)

    // Clean up
    return () => {
      clearInterval(intervalId);
      retryCount = 0;
    };
  }, []);

  // Get the current knot definition
  const getKnotDefinition = (): KnotDefinition | null => {
    return KNOT_DEFINITIONS[knotId] || null;
  };

  // Get all stages in order for the current knot
  const getAllStages = (): string[] => {
    const knotDef = getKnotDefinition();
    return knotDef ? knotDef.stages.map((stage) => stage.id) : [];
  };

  // Get stage info by ID
  const getStageInfo = (stageId: string): KnotStage | null => {
    const knotDef = getKnotDefinition();
    if (!knotDef) return null;
    return knotDef.stages.find((stage) => stage.id === stageId) || null;
  };

  // Get the next expected stage based on completed stages
  const getNextExpectedStage = (): string | null => {
    const allStages = getAllStages();
    if (allStages.length === 0) return null;

    // If no stages are completed, return the first stage
    if (completedStages.length === 0) {
      return allStages[0];
    }

    // Find the last completed stage
    const lastCompletedStage = completedStages[completedStages.length - 1];
    const lastCompletedIndex = allStages.indexOf(lastCompletedStage);

    // If we've completed all stages, return null
    if (lastCompletedIndex === allStages.length - 1) {
      return null;
    }

    // Return the next stage after the last completed one
    return allStages[lastCompletedIndex + 1];
  };

  // Process classification data to determine current stage and progression
  const processClassification = (data: ClassificationResponse) => {
    if (!data.stage) return;

    // Map the API stage ID to our internal stage ID
    const apiStageId = data.stage;
    const mappedStageId = STAGE_ID_MAPPING[knotId]?.[apiStageId];

    if (!mappedStageId) {
      console.warn(
        `No mapping found for stage ${apiStageId} in knot ${knotId}`,
      );
      return;
    }

    const now = Date.now();

    // Add the new detection to history
    setStageHistory((prev) => {
      const newHistory = [...prev, { stage: mappedStageId, timestamp: now }];

      // Remove old entries outside the stability window
      const recentHistory = newHistory.filter(
        (entry) => now - entry.timestamp <= STABILITY_WINDOW_MS,
      );

      // Check if we have enough consistent detections
      if (recentHistory.length >= REQUIRED_CONSISTENT_DETECTIONS) {
        const allSame = recentHistory.every(
          (entry) => entry.stage === mappedStageId,
        );

        // Only proceed if the detected stage matches the current stage
        if (
          allSame &&
          mappedStageId === currentStage &&
          !completedStages.includes(mappedStageId)
        ) {
          // Notify parent of stage completion
          onStageComplete?.(mappedStageId);

          // Clear history after successful progression
          return [];
        }
      }

      return recentHistory;
    });
  };

  if (loading) {
    return (
      <div className='p-4 bg-gray-100 rounded-lg animate-pulse'>
        Loading knot instructions...
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-4 bg-red-100 text-red-700 rounded-lg'>{error}</div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      {/* Knot completion message */}
      {knotCompleted && (
        <div className='mb-6 p-4 bg-green-100 text-green-800 rounded-lg border border-green-300'>
          <h3 className='text-lg font-bold flex items-center'>
            <FaCheck className='mr-2' /> Congratulations!
          </h3>
          <p className='mt-2'>
            You've successfully completed all steps of this knot!
          </p>
        </div>
      )}

      {/* Success message */}
      {showSuccess && !knotCompleted && (
        <div className='mb-4 p-3 bg-green-100 text-green-800 rounded-lg border border-green-300 flex items-center'>
          <FaCheck className='mr-2' />
          {successMessage}
        </div>
      )}

      {/* Current and next steps */}
      <div className='space-y-4'>
        {/* Current step */}
        {!knotCompleted && currentStage && (
          <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
            <h3 className='text-lg font-semibold text-blue-800 mb-2'>
              Current Step
            </h3>
            <div className='flex items-start'>
              <div className='w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white mr-3 flex-shrink-0'>
                {completedStages.length + 1}
              </div>
              <div className='flex-grow'>
                <h4 className='font-medium text-blue-900'>
                  {getStageInfo(currentStage)?.name}
                </h4>
                <p className='text-blue-700 mb-3'>
                  {getStageInfo(currentStage)?.description}
                </p>
                <button
                  onClick={() => onStageComplete?.(currentStage)}
                  className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
                >
                  Validate Step
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnotStepInstructions;
