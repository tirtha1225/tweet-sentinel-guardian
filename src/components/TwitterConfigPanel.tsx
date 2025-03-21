
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModelTrainingPanel from "@/components/ModelTrainingPanel";

const TwitterConfigPanel = () => {
  const [bearerToken, setBearerToken] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [region, setRegion] = useState("us");
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("config");
  
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
    <Card className="h-full overflow-y-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsList className="grid grid-cols-2 mb-0 w-full rounded-t-lg rounded-b-none">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="training">Model Training</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config" className="m-0 h-full p-6 pt-5">
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
        </TabsContent>
        
        <TabsContent value="training" className="m-0 h-full">
          <ModelTrainingPanel />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default TwitterConfigPanel;
