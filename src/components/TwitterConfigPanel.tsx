
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { twitterApiService } from "@/lib/twitterApiService";
import { openaiService } from "@/lib/openaiService";
import RegionSelector from "@/components/twitter/RegionSelector";
import TwitterCredentials from "@/components/twitter/TwitterCredentials";
import KeywordManager from "@/components/twitter/KeywordManager";
import ConnectionStatus from "@/components/twitter/ConnectionStatus";
import ControlButtons from "@/components/twitter/ControlButtons";
import OpenAICredentials from "@/components/OpenAICredentials";
import { Separator } from "@/components/ui/separator";

const TwitterConfigPanel = () => {
  const [bearerToken, setBearerToken] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [region, setRegion] = useState("us");
  const [isConnected, setIsConnected] = useState(false);
  const [openaiKey, setOpenaiKey] = useState("");
  
  useEffect(() => {
    // Load Twitter API configuration
    const config = twitterApiService.getConfig();
    setBearerToken(config.bearerToken || "");
    setKeywords(config.keywords || []);
    setRegion(config.region || "us");
    setIsConnected(config.isActive || false);
    
    // Load OpenAI API key
    const apiKey = openaiService.getApiKey();
    setOpenaiKey(apiKey || "");
    
    // Subscribe to connection status changes
    const unsubscribe = twitterApiService.subscribeToConnectionStatus((status) => {
      setIsConnected(status);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  const handleBearerTokenChange = (token: string) => {
    setBearerToken(token);
    twitterApiService.updateConfig({ bearerToken: token });
  };
  
  const handleOpenAIKeyChange = (key: string) => {
    setOpenaiKey(key);
    openaiService.setApiKey(key);
  };
  
  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion);
    twitterApiService.updateConfig({ region: newRegion });
  };
  
  const handleAddKeyword = () => {
    if (newKeyword && !keywords.includes(newKeyword)) {
      const updatedKeywords = [...keywords, newKeyword];
      setKeywords(updatedKeywords);
      twitterApiService.updateConfig({ keywords: updatedKeywords });
      setNewKeyword("");
    }
  };
  
  const handleRemoveKeyword = (keyword: string) => {
    const updatedKeywords = keywords.filter(k => k !== keyword);
    setKeywords(updatedKeywords);
    twitterApiService.updateConfig({ keywords: updatedKeywords });
  };
  
  const handleConnect = () => {
    if (bearerToken && keywords.length > 0) {
      twitterApiService.connect();
    }
  };
  
  const handleDisconnect = () => {
    twitterApiService.disconnect();
  };
  
  return (
    <Card className="h-full overflow-y-auto p-6">
      <h2 className="text-xl font-bold mb-4">API Configuration</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Twitter API</h3>
          <TwitterCredentials 
            bearerToken={bearerToken}
            onBearerTokenChange={handleBearerTokenChange}
          />
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-semibold mb-2">OpenAI API</h3>
          <OpenAICredentials 
            apiKey={openaiKey}
            onApiKeyChange={handleOpenAIKeyChange}
          />
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Twitter Stream Settings</h3>
          <RegionSelector 
            selectedRegion={region} 
            onRegionChange={handleRegionChange} 
          />
          
          <div className="mt-4">
            <KeywordManager
              keywords={keywords}
              newKeyword={newKeyword}
              onNewKeywordChange={setNewKeyword}
              onAddKeyword={handleAddKeyword}
              onRemoveKeyword={handleRemoveKeyword}
            />
          </div>
        </div>
        
        <Separator />
        
        <div>
          <ConnectionStatus isConnected={isConnected} />
          
          <div className="mt-2">
            <ControlButtons
              isConnected={isConnected}
              canConnect={!!bearerToken && keywords.length > 0}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TwitterConfigPanel;
