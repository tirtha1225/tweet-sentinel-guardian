
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { twitterApiService } from "@/lib/twitterApiService";
import TwitterCredentials from "@/components/twitter/TwitterCredentials";
import RegionSelector from "@/components/twitter/RegionSelector";
import KeywordManager from "@/components/twitter/KeywordManager";
import ConnectionStatus from "@/components/twitter/ConnectionStatus";
import ControlButtons from "@/components/twitter/ControlButtons";
import ModelLoadingStatus from "@/components/ModelLoadingStatus";
import { Separator } from "@/components/ui/separator";

const TwitterConfigPanel = () => {
  const [bearerToken, setBearerToken] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [region, setRegion] = useState("us");
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Load Twitter API configuration
    const config = twitterApiService.getConfig();
    setBearerToken(config.bearerToken || "");
    setKeywords(config.keywords || []);
    setRegion(config.region || "us");
    setIsConnected(config.isActive || false);
    
    // Get current connection status
    const connectionStatus = twitterApiService.getConnectionStatus();
    setIsConnected(connectionStatus);
    
    // Create connection status subscription
    const unsubscribe = twitterApiService.onConnectionStatusChange((status) => {
      setIsConnected(status);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  const handleBearerTokenChange = (token: string) => {
    setBearerToken(token);
    twitterApiService.setBearerToken(token);
  };
  
  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion);
    twitterApiService.setRegion(newRegion);
  };
  
  const handleAddKeyword = () => {
    if (newKeyword && !keywords.includes(newKeyword)) {
      const updatedKeywords = [...keywords, newKeyword];
      setKeywords(updatedKeywords);
      twitterApiService.setKeywords(updatedKeywords);
      setNewKeyword("");
    }
  };
  
  const handleRemoveKeyword = (keyword: string) => {
    const updatedKeywords = keywords.filter(k => k !== keyword);
    setKeywords(updatedKeywords);
    twitterApiService.setKeywords(updatedKeywords);
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
          <h3 className="text-lg font-semibold mb-2">Content Moderation</h3>
          <ModelLoadingStatus />
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Twitter Stream Settings</h3>
          <RegionSelector 
            region={region} 
            onRegionChange={handleRegionChange} 
          />
          
          <div className="mt-4">
            <KeywordManager
              keywords={keywords}
              currentKeyword={newKeyword}
              onKeywordChange={setNewKeyword}
              onAddKeyword={handleAddKeyword}
              onRemoveKeyword={handleRemoveKeyword}
            />
          </div>
        </div>
        
        <Separator />
        
        <div>
          <ConnectionStatus 
            connected={isConnected} 
          />
          
          <div className="mt-2">
            <ControlButtons
              connected={isConnected}
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
