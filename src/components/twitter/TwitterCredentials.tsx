
import React from "react";
import { Input } from "@/components/ui/input";

interface TwitterCredentialsProps {
  bearerToken: string;
  onBearerTokenChange: (value: string) => void;
}

const TwitterCredentials: React.FC<TwitterCredentialsProps> = ({ bearerToken, onBearerTokenChange }) => {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block">Twitter API Bearer Token</label>
      <Input
        type="password"
        placeholder="Enter your Twitter API Bearer Token"
        value={bearerToken}
        onChange={(e) => onBearerTokenChange(e.target.value)}
        className="mb-1"
      />
      <p className="text-xs text-neutral-500">Required for connecting to Twitter's API.</p>
    </div>
  );
};

export default TwitterCredentials;
