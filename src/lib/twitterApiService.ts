
import { moderationService } from './moderationService';
import { Tweet } from './mockData';

interface TwitterApiConfig {
  apiKey: string;
  apiSecret: string;
  bearerToken: string;
  keywords: string[];
  isActive: boolean;
  region?: string;
}

class TwitterApiService {
  private config: TwitterApiConfig = {
    apiKey: '',
    apiSecret: '',
    bearerToken: '',
    keywords: [],
    isActive: false,
    region: 'us'
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
    
    try {
      console.log('Connecting to Twitter API with keywords:', this.config.keywords);
      
      // Clear any existing connection
      if (this.streamConnection) {
        this.streamConnection.close();
      }
      
      // In real production code, we would use a proper Twitter API library
      // For now, we'll use a simplified approach with the Twitter API v2
      
      // First, set up filtered stream rules with our keywords
      const rulesResponse = await this.setupStreamRules();
      if (!rulesResponse) {
        this.connectionStatus = 'error';
        this.notifyListeners(this.connectionStatus);
        return false;
      }
      
      // Connect to the stream
      await this.connectToStream();
      
      this.connectionStatus = 'connected';
      this.notifyListeners(this.connectionStatus);
      console.log('Connected to Twitter stream');
      
      return true;
    } catch (error) {
      console.error('Failed to connect to Twitter API', error);
      this.connectionStatus = 'error';
      this.notifyListeners(this.connectionStatus);
      return false;
    }
  }
  
  // Set up stream rules based on keywords
  private async setupStreamRules(): Promise<boolean> {
    try {
      // First, get and delete any existing rules
      const rulesUrl = 'https://api.twitter.com/2/tweets/search/stream/rules';
      
      const existingRulesResponse = await fetch(rulesUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.bearerToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!existingRulesResponse.ok) {
        throw new Error(`Failed to get existing rules: ${existingRulesResponse.statusText}`);
      }
      
      const existingRules = await existingRulesResponse.json();
      
      // Delete existing rules if there are any
      if (existingRules.data && existingRules.data.length > 0) {
        const ids = existingRules.data.map((rule: any) => rule.id);
        
        const deleteResponse = await fetch(rulesUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.bearerToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            delete: { ids }
          }),
        });
        
        if (!deleteResponse.ok) {
          throw new Error(`Failed to delete existing rules: ${deleteResponse.statusText}`);
        }
      }
      
      // Add new rules based on keywords
      const rules = this.config.keywords.map(keyword => ({
        value: keyword + (this.config.region ? ` place_country:${this.config.region}` : ''),
        tag: `keyword-${keyword}`
      }));
      
      const addResponse = await fetch(rulesUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          add: rules
        }),
      });
      
      if (!addResponse.ok) {
        throw new Error(`Failed to add stream rules: ${addResponse.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error setting up stream rules:', error);
      return false;
    }
  }
  
  // Connect to the filtered stream
  private async connectToStream(): Promise<void> {
    const streamUrl = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=created_at&expansions=author_id&user.fields=name,username,profile_image_url';
    
    // Using EventSource for the stream connection
    this.streamConnection = new EventSource(streamUrl, {
      headers: {
        'Authorization': `Bearer ${this.config.bearerToken}`
      }
    } as any);
    
    this.streamConnection.onopen = () => {
      console.log('Stream connection opened');
    };
    
    this.streamConnection.onerror = (event) => {
      console.error('Stream connection error:', event);
      this.connectionStatus = 'error';
      this.notifyListeners(this.connectionStatus);
    };
    
    this.streamConnection.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received tweet:', data);
        
        if (!data || !data.data) return;
        
        const tweet = data.data;
        const user = data.includes?.users?.find((u: any) => u.id === tweet.author_id);
        
        if (!user) return;
        
        // Process this tweet through our moderation service
        await moderationService.processTweet(tweet.text, {
          name: user.name,
          username: user.username,
          profileImage: user.profile_image_url || "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png",
          source: 'twitter'
        });
      } catch (error) {
        console.error('Error processing tweet:', error);
      }
    };
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
  
  // For simulation/fallback when real API connection fails
  simulateTweets(): void {
    if (!this.config.isActive || !this.config.keywords.length) return;
    
    const intervalId = setInterval(() => {
      if (this.connectionStatus !== 'connected') {
        clearInterval(intervalId);
        return;
      }
      
      this.processMockTweet();
    }, 5000);
  }
  
  // Generate a mock tweet that includes one of our keywords (for simulation)
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
