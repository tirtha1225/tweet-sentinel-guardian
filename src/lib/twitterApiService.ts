
import { moderationService } from './moderationService';
import { Tweet } from './mockData';

interface TwitterApiConfig {
  apiKey: string;
  apiSecret: string;
  bearerToken: string;
  keywords: string[];
  isActive: boolean;
}

class TwitterApiService {
  private config: TwitterApiConfig = {
    apiKey: '',
    apiSecret: '',
    bearerToken: '',
    keywords: [],
    isActive: false
  };
  
  private streamConnection: EventSource | null = null;
  private listeners: Array<(status: string) => void> = [];
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  
  constructor() {
    // Load config from localStorage on initialization
    this.loadConfig();
  }
  
  getConfig(): TwitterApiConfig {
    return { ...this.config };
  }
  
  setConfig(newConfig: Partial<TwitterApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('twitter_api_config', JSON.stringify(this.config));
  }
  
  loadConfig(): void {
    const savedConfig = localStorage.getItem('twitter_api_config');
    if (savedConfig) {
      try {
        this.config = JSON.parse(savedConfig);
      } catch (e) {
        console.error('Failed to parse saved Twitter API config', e);
      }
    }
  }
  
  getConnectionStatus(): string {
    return this.connectionStatus;
  }
  
  // Connect to Twitter streaming API
  async connect(): Promise<boolean> {
    if (
      !this.config.bearerToken || 
      !this.config.keywords.length || 
      this.connectionStatus === 'connected' || 
      this.connectionStatus === 'connecting'
    ) {
      return false;
    }
    
    this.connectionStatus = 'connecting';
    this.notifyListeners(this.connectionStatus);
    
    // In a real implementation, we would use the Twitter API v2 filtered stream endpoint
    // For demo purposes, we'll simulate a connection with mock data
    
    try {
      // Simulate connecting to Twitter stream
      console.log('Connecting to Twitter API with keywords:', this.config.keywords);
      
      // We're simulating a streaming connection with periodic updates
      // In a real app, you would use the Twitter API's streaming endpoints
      const intervalId = setInterval(() => {
        if (this.connectionStatus !== 'connected' && this.connectionStatus !== 'connecting') {
          clearInterval(intervalId);
          return;
        }
        
        // Generate a random tweet that contains one of our keywords
        this.processMockTweet();
      }, 5000); // Generate a new tweet every 5 seconds
      
      // Set connection status after a short delay to simulate connecting
      setTimeout(() => {
        this.connectionStatus = 'connected';
        this.notifyListeners(this.connectionStatus);
        console.log('Connected to Twitter stream');
      }, 1500);
      
      return true;
    } catch (error) {
      console.error('Failed to connect to Twitter API', error);
      this.connectionStatus = 'error';
      this.notifyListeners(this.connectionStatus);
      return false;
    }
  }
  
  disconnect(): void {
    if (this.streamConnection) {
      this.streamConnection.close();
      this.streamConnection = null;
    }
    
    this.connectionStatus = 'disconnected';
    this.notifyListeners(this.connectionStatus);
    console.log('Disconnected from Twitter stream');
  }
  
  // Generate a mock tweet that includes one of our keywords
  private processMockTweet(): void {
    if (!this.config.keywords.length || !this.config.isActive) return;
    
    const keyword = this.config.keywords[Math.floor(Math.random() * this.config.keywords.length)];
    
    // A list of tweet templates
    const tweetTemplates = [
      `Just heard about ${keyword} and I'm so excited! #trending`,
      `Can't believe what's happening with ${keyword} right now. Thoughts?`,
      `${keyword} is absolutely terrible. I'm so disappointed. #angry`,
      `Does anyone else think ${keyword} is overrated? I don't get the hype.`,
      `${keyword} changed my life! Best decision ever. #recommended`,
      `Is it just me or is ${keyword} getting worse every day? #frustrated`,
      `Just bought tickets to see ${keyword}! Can't wait! #excited`,
      `My experience with ${keyword} was absolutely horrible. Never again.`,
      `${keyword} is the future. Mark my words. #innovation`,
      `I think ${keyword} should be banned immediately. It's causing so many problems.`
    ];
    
    const randomTemplate = tweetTemplates[Math.floor(Math.random() * tweetTemplates.length)];
    
    // Random user profiles
    const profiles = [
      { name: "Sam Wilson", username: "falcon", image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
      { name: "Maria Hill", username: "agent19", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
      { name: "Bruce Banner", username: "greenscientist", image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
      { name: "Natasha Romanoff", username: "blackwidow", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
      { name: "Tony Stark", username: "ironman", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" }
    ];
    
    const randomProfile = profiles[Math.floor(Math.random() * profiles.length)];
    
    // Process the tweet through the moderation service
    moderationService.processTweet(randomTemplate, {
      name: randomProfile.name,
      username: randomProfile.username,
      profileImage: randomProfile.image,
      source: 'twitter'
    });
  }
  
  // Subscribe to connection status updates
  subscribe(listener: (status: string) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  // Notify all listeners of status changes
  private notifyListeners(status: string): void {
    this.listeners.forEach(listener => listener(status));
  }
}

// Export a singleton instance
export const twitterApiService = new TwitterApiService();
