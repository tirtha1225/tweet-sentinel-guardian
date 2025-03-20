// Type definitions for Twitter API
interface TwitterConfig {
  bearerToken: string;
  keywords: string[];
  region: string;
  isActive: boolean;
}

interface TwitterStreamParams {
  keywords: string[];
  region: string;
}

// This service handles interactions with Twitter API
class TwitterApiService {
  private config = {
    bearerToken: '',
    keywords: [] as string[],
    region: 'us',
    isActive: false
  };
  
  private connectionListeners: Array<(status: boolean) => void> = [];
  
  constructor() {
    // Load config from localStorage if available
    const savedConfig = localStorage.getItem('twitter_api_config');
    if (savedConfig) {
      this.config = JSON.parse(savedConfig);
    }
  }
  
  getConfig() {
    return { ...this.config };
  }
  
  setBearerToken(token: string) {
    this.config.bearerToken = token;
    this.saveConfig();
  }
  
  setKeywords(keywords: string[]) {
    this.config.keywords = keywords;
    this.saveConfig();
  }
  
  setRegion(region: string) {
    this.config.region = region;
    this.saveConfig();
  }
  
  private saveConfig() {
    localStorage.setItem('twitter_api_config', JSON.stringify(this.config));
  }
  
  connect() {
    // In a real implementation, this would connect to Twitter's streaming API
    console.log('Connecting to Twitter API with config:', this.config);
    
    // Simulate successful connection
    setTimeout(() => {
      console.log('Connected to Twitter API');
      this.config.isActive = true;
      this.saveConfig();
      this.notifyConnectionListeners(true);
    }, 1000);
  }
  
  disconnect() {
    // In a real implementation, this would disconnect from Twitter's streaming API
    console.log('Disconnecting from Twitter API');
    
    // Simulate successful disconnection
    setTimeout(() => {
      console.log('Disconnected from Twitter API');
      this.config.isActive = false;
      this.saveConfig();
      this.notifyConnectionListeners(false);
    }, 500);
  }
  
  getConnectionStatus() {
    return this.config.isActive;
  }
  
  onConnectionStatusChange(listener: (status: boolean) => void) {
    this.connectionListeners.push(listener);
    return () => {
      const index = this.connectionListeners.indexOf(listener);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }
  
  private notifyConnectionListeners(status: boolean) {
    this.connectionListeners.forEach(listener => listener(status));
  }
  
  updateConfig(partialConfig: Partial<TwitterConfig>) {
    this.config = {
      ...this.config,
      ...partialConfig
    };
    this.saveConfig();
  }
  
  subscribeToConnectionStatus(callback: (isConnected: boolean) => void) {
    return this.onConnectionStatusChange(callback);
  }
}

// Export singleton instance
export const twitterApiService = new TwitterApiService();
