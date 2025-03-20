
import React from "react";
import { Wifi, WifiOff } from "lucide-react";

export interface ConnectionStatusProps {
  connected: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ connected }) => {
  return (
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
  );
};

export default ConnectionStatus;
