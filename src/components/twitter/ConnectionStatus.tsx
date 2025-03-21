
import React from "react";
import { Wifi, WifiOff, Brain } from "lucide-react";
import { huggingFaceService } from "@/lib/llmService";

export interface ConnectionStatusProps {
  connected: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ connected }) => {
  const isTrained = huggingFaceService.isModelTrained?.() || false;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        {connected ? (
          <>
            <Wifi className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-500">Connected to Twitter API</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-neutral-500" />
            <span className="text-sm font-medium text-neutral-500">Not connected to Twitter API</span>
          </>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Brain className={`h-4 w-4 ${isTrained ? "text-green-500" : "text-neutral-500"}`} />
        <span className={`text-sm font-medium ${isTrained ? "text-green-500" : "text-neutral-500"}`}>
          {isTrained ? "Model trained with custom data" : "Model using default parameters"}
        </span>
      </div>
    </div>
  );
};

export default ConnectionStatus;
