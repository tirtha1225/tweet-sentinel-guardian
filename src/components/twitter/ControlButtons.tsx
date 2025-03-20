
import React from "react";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ControlButtonsProps {
  connected: boolean;
  canConnect: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  connected,
  canConnect,
  onConnect,
  onDisconnect,
}) => {
  return (
    <div className="flex space-x-2">
      {!connected ? (
        <Button
          variant="outline"
          size="sm"
          className="text-green-500 border-green-500 hover:bg-green-50 hover:text-green-600"
          onClick={onConnect}
          disabled={!canConnect}
        >
          <Play className="h-4 w-4 mr-1" />
          Connect
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={onDisconnect}
        >
          <Square className="h-4 w-4 mr-1" />
          Disconnect
        </Button>
      )}
    </div>
  );
};

export default ControlButtons;
