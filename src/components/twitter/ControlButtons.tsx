
import React from "react";
import { PlayCircle, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ControlButtonsProps {
  connectionStatus: string;
  onSaveConfig: () => void;
  onToggleConnection: () => void;
  isSubmitting: boolean;
  canConnect: boolean;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({ 
  connectionStatus, 
  onSaveConfig, 
  onToggleConnection, 
  isSubmitting,
  canConnect
}) => {
  return (
    <div className="flex justify-between mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-800">
      <Button
        variant="outline"
        onClick={onSaveConfig}
        disabled={isSubmitting}
      >
        Save Configuration
      </Button>
      
      <Button
        onClick={onToggleConnection}
        disabled={connectionStatus === "connecting" || !canConnect}
        className={connectionStatus === "connected" ? "bg-red-500 hover:bg-red-600" : "bg-blue-light hover:bg-blue-dark"}
      >
        {connectionStatus === "connected" ? (
          <>
            <StopCircle className="mr-2 h-4 w-4" />
            Disconnect
          </>
        ) : (
          <>
            <PlayCircle className="mr-2 h-4 w-4" />
            Connect
          </>
        )}
      </Button>
    </div>
  );
};

export default ControlButtons;
