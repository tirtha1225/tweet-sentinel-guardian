
import React, { useState, useEffect } from "react";
import { Loader2, Brain } from "lucide-react";
import { huggingFaceService } from "@/lib/llmService";

interface ModelLoadingStatusProps {
  onModelLoaded?: () => void;
}

const ModelLoadingStatus: React.FC<ModelLoadingStatusProps> = ({ onModelLoaded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isTrained, setIsTrained] = useState(false);
  const [trainingExamples, setTrainingExamples] = useState(0);

  useEffect(() => {
    let mounted = true;
    
    const checkModels = async () => {
      if (isLoaded) return;
      
      try {
        setIsLoading(true);
        setLoadError(null);
        
        // Try to load models
        await huggingFaceService.loadModels();
        
        if (mounted) {
          setIsLoaded(true);
          setIsLoading(false);
          setIsTrained(huggingFaceService.isModelTrained());
          setTrainingExamples(huggingFaceService.getTrainingData().length);
          if (onModelLoaded) onModelLoaded();
        }
      } catch (error) {
        if (mounted) {
          setLoadError("Failed to load Hugging Face models. Using fallback analysis.");
          setIsLoading(false);
        }
      }
    };
    
    // Check if models are already loaded
    if (huggingFaceService.isModelLoaded()) {
      setIsLoaded(true);
      setIsTrained(huggingFaceService.isModelTrained());
      setTrainingExamples(huggingFaceService.getTrainingData().length);
      if (onModelLoaded) onModelLoaded();
    } else {
      checkModels();
    }
    
    // Set up an interval to check for training updates
    const trainingInterval = setInterval(() => {
      if (mounted) {
        setIsTrained(huggingFaceService.isModelTrained());
        setTrainingExamples(huggingFaceService.getTrainingData().length);
      }
    }, 2000);
    
    return () => {
      mounted = false;
      clearInterval(trainingInterval);
    };
  }, [onModelLoaded, isLoaded]);

  return (
    <div className="rounded-lg border p-3 text-sm">
      <h3 className="font-medium mb-1">Content Moderation Model</h3>
      
      {isLoading && (
        <div className="flex items-center text-amber-600">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          <span>Loading Hugging Face models...</span>
        </div>
      )}
      
      {isLoaded && !isLoading && (
        <div className="flex items-center text-green-600">
          <svg
            className="h-4 w-4 mr-2"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <span>Hugging Face models loaded successfully</span>
        </div>
      )}
      
      {loadError && (
        <div className="flex items-center text-red-600">
          <svg
            className="h-4 w-4 mr-2"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="m12 8-8 8h16l-8-8Z" />
            <path d="M12 16v-4" />
          </svg>
          <span>{loadError}</span>
        </div>
      )}
      
      {isLoaded && !isLoading && (
        <div className="flex items-center mt-2 text-neutral-600">
          <Brain className="h-4 w-4 mr-2" />
          <span>
            {isTrained 
              ? `Model trained with ${trainingExamples} custom examples` 
              : trainingExamples > 0 
                ? `${trainingExamples} training examples added (not trained yet)`
                : "Model using default parameters"}
          </span>
        </div>
      )}
      
      <p className="text-neutral-500 text-xs mt-1">
        Using Hugging Face Transformers for free, on-device content moderation
      </p>
    </div>
  );
};

export default ModelLoadingStatus;
