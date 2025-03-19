
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { twitterApiService } from "@/lib/twitterApiService";

// Import our new components
import KeywordManager from "@/components/twitter/KeywordManager";
import RegionSelector from "@/components/twitter/RegionSelector";
import TwitterCredentials from "@/components/twitter/TwitterCredentials";
import ConnectionStatus from "@/components/twitter/ConnectionStatus";
import ControlButtons from "@/components/twitter/ControlButtons";

const TwitterConfigPanel: React.FC = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [bearerToken, setBearerToken] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [region, setRegion] = useState("us");
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load config from service
    const config = twitterApiService.getConfig();
    setBearerToken(config.bearerToken);
    setKeywords(config.keywords);
    setIsActive(config.isActive);
    setRegion(config.region || "us");
    
    // Subscribe to status updates
    const unsubscribe = twitterApiService.subscribe((status) => {
      setConnectionStatus(status);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const handleKeywordsChange = (newKeywords: string[]) => {
    setKeywords(newKeywords);
    twitterApiService.setConfig({ keywords: newKeywords });
  };

  const handleRegionChange = (value: string) => {
    setRegion(value);
    twitterApiService.setConfig({ region: value });
  };

  const handleSaveConfig = () => {
    setIsSubmitting(true);
    
    try {
      twitterApiService.setConfig({
        apiKey,
        apiSecret,
        bearerToken,
        keywords,
        isActive,
        region
      });
      
      toast({
        title: "Configuration saved",
        description: "Twitter API configuration has been updated.",
        duration: 3000,
      });
      
      // Clear sensitive fields
      setApiKey("");
      setApiSecret("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleConnection = async () => {
    if (connectionStatus === "connected" || connectionStatus === "connecting") {
      twitterApiService.disconnect();
    } else {
      const config = twitterApiService.getConfig();
      
      if (!config.bearerToken) {
        toast({
          title: "Missing credentials",
          description: "Please provide a Bearer Token to connect.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      
      if (!config.keywords.length) {
        toast({
          title: "Missing keywords",
          description: "Please add at least one keyword to track.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      
      const success = await twitterApiService.connect();
      
      if (!success) {
        toast({
          title: "Connection failed",
          description: "Failed to connect to Twitter API. Check your credentials.",
          variant: "destructive",
          duration: 3000,
        });
        // Fall back to simulation if real connection fails
        twitterApiService.simulateTweets();
      }
    }
  };

  const handleToggleActive = (value: boolean) => {
    setIsActive(value);
    twitterApiService.setConfig({ isActive: value });
    
    if (value && connectionStatus === "disconnected") {
      // Automatically connect when activating
      handleToggleConnection();
    }
  };

  const canConnect = bearerToken !== "" && keywords.length > 0;

  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">X/Twitter Integration</h2>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Switch 
            id="twitter-active"
            checked={isActive}
            onCheckedChange={handleToggleActive}
          />
          <Label htmlFor="twitter-active">Enable Twitter Monitoring</Label>
        </div>
        
        <ConnectionStatus status={connectionStatus as any} />
      </div>
      
      <div className="space-y-4 mb-6">
        <KeywordManager 
          keywords={keywords} 
          onKeywordsChange={handleKeywordsChange} 
        />
        
        <RegionSelector 
          region={region} 
          onRegionChange={handleRegionChange} 
        />
        
        <TwitterCredentials 
          bearerToken={bearerToken} 
          onBearerTokenChange={setBearerToken} 
        />
      </div>
      
      <ControlButtons 
        connectionStatus={connectionStatus}
        onSaveConfig={handleSaveConfig}
        onToggleConnection={handleToggleConnection}
        isSubmitting={isSubmitting}
        canConnect={canConnect}
      />
    </div>
  );
};

export default TwitterConfigPanel;
