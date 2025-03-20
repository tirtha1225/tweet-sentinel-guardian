
import React from "react";
import { Input } from "@/components/ui/input";
import { openaiService } from "@/lib/openaiService";

interface OpenAICredentialsProps {
  apiKey: string;
  onApiKeyChange: (value: string) => void;
}

const OpenAICredentials: React.FC<OpenAICredentialsProps> = ({ apiKey, onApiKeyChange }) => {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block">OpenAI API Key</label>
      <Input
        type="password"
        placeholder="Enter your OpenAI API Key"
        value={apiKey}
        onChange={(e) => onApiKeyChange(e.target.value)}
        className="mb-1"
      />
      <p className="text-xs text-neutral-500">
        Required for connecting to OpenAI's GPT-4 API for advanced content moderation.
        Your API key is stored locally and never sent to our servers.
      </p>
    </div>
  );
};

export default OpenAICredentials;
