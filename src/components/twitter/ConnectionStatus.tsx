
import React from "react";
import { Badge } from "@/components/ui/badge";

type ConnectionStatusType = "connected" | "connecting" | "error" | "disconnected";

interface ConnectionStatusProps {
  status: ConnectionStatusType;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  return (
    <Badge 
      variant="outline" 
      className={`
        px-3 py-1 
        ${status === "connected" ? "bg-green-500/10 text-green-600 border-green-600" : 
          status === "connecting" ? "bg-yellow-500/10 text-yellow-600 border-yellow-600" :
          status === "error" ? "bg-red-500/10 text-red-600 border-red-600" :
          "bg-neutral-200 text-neutral-600 border-neutral-400"}
      `}
    >
      {status === "connected" ? "Connected" :
       status === "connecting" ? "Connecting..." :
       status === "error" ? "Connection Error" :
       "Disconnected"}
    </Badge>
  );
};

export default ConnectionStatus;
