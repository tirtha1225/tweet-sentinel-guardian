
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlayCircle, StopCircle, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { twitterApiService } from "@/lib/twitterApiService";

const TwitterConfigPanel: React.FC = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [bearerToken, setBearerToken] = useState("");
  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load config from service
    const config = twitterApiService.getConfig();
    setBearerToken(config.bearerToken);
    setKeywords(config.keywords);
    setIsActive(config.isActive);
    
    // Subscribe to status updates
    const unsubscribe = twitterApiService.subscribe((status) => {
      setConnectionStatus(status);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const handleAddKeyword = () => {
    if (keyword.trim() && !keywords.includes(keyword.trim())) {
      const newKeywords = [...keywords, keyword.trim()];
      setKeywords(newKeywords);
      twitterApiService.setConfig({ keywords: newKeywords });
      setKeyword("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    const newKeywords = keywords.filter(k => k !== keywordToRemove);
    setKeywords(newKeywords);
    twitterApiService.setConfig({ keywords: newKeywords });
  };

  const handleSaveConfig = () => {
    setIsSubmitting(true);
    
    try {
      twitterApiService.setConfig({
        apiKey,
        apiSecret,
        bearerToken,
        keywords,
        isActive
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
        
        <Badge 
          variant="outline" 
          className={`
            px-3 py-1 
            ${connectionStatus === "connected" ? "bg-green-500/10 text-green-600 border-green-600" : 
              connectionStatus === "connecting" ? "bg-yellow-500/10 text-yellow-600 border-yellow-600" :
              connectionStatus === "error" ? "bg-red-500/10 text-red-600 border-red-600" :
              "bg-neutral-200 text-neutral-600 border-neutral-400"}
          `}
        >
          {connectionStatus === "connected" ? "Connected" :
           connectionStatus === "connecting" ? "Connecting..." :
           connectionStatus === "error" ? "Connection Error" :
           "Disconnected"}
        </Badge>
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm font-medium mb-1 block">Keywords to Monitor</label>
          <div className="flex space-x-2 mb-2">
            <Input
              type="text"
              placeholder="Add keyword or hashtag..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddKeyword();
                }
              }}
              className="flex-1"
            />
            <Button 
              type="button"
              size="icon"
              onClick={handleAddKeyword}
              disabled={!keyword.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {keywords.map((kw, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="flex items-center space-x-1 py-1"
              >
                <span>{kw}</span>
                <button 
                  onClick={() => handleRemoveKeyword(kw)} 
                  className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {keywords.length === 0 && (
              <p className="text-sm text-neutral-500">No keywords added. Add keywords to monitor.</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Twitter API Bearer Token</label>
          <Input
            type="password"
            placeholder="Enter your Twitter API Bearer Token"
            value={bearerToken}
            onChange={(e) => setBearerToken(e.target.value)}
            className="mb-1"
          />
          <p className="text-xs text-neutral-500">Required for connecting to Twitter's API.</p>
        </div>
      </div>
      
      <div className="flex justify-between mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <Button
          variant="outline"
          onClick={handleSaveConfig}
          disabled={isSubmitting}
        >
          Save Configuration
        </Button>
        
        <Button
          onClick={handleToggleConnection}
          disabled={connectionStatus === "connecting" || !bearerToken || keywords.length === 0}
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
    </div>
  );
};

export default TwitterConfigPanel;
