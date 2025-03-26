
import { Tweet, mockTweets } from './mockData';
import { analyzeTweetContent, LLMAnalysisResult, huggingFaceService } from './llmService';
import { twitterApiService } from './twitterApiService';

interface TweetSource {
  name?: string;
  username?: string;
  profileImage?: string;
  source?: string;
}

// This would typically connect to an API or backend service
// For demo purposes, we'll use the mock data

class ModerationService {
  private tweets: Tweet[] = [...mockTweets];
  private listeners: Array<() => void> = [];

  constructor() {
    // Initialize Twitter context training status
    const twitterContextEnabled = twitterApiService.isContextTrainingEnabled();
    if (twitterContextEnabled) {
      huggingFaceService.enableTwitterContextTraining();
    }
  }

  // Get all tweets
  getAllTweets(): Tweet[] {
    return [...this.tweets];
  }

  // Get tweets by status
  getTweetsByStatus(status: string): Tweet[] {
    return this.tweets.filter(tweet => tweet.status === status);
  }

  // Get tweets by source
  getTweetsBySource(source: string): Tweet[] {
    return this.tweets.filter(tweet => tweet.source === source);
  }

  // Process a new tweet with LLM analysis
  async processTweet(tweetContent: string, source?: TweetSource): Promise<Tweet> {
    // Create a new tweet ID
    const tweetId = `tweet-${Date.now()}`;
    
    // Store tweet context for training if Twitter context training is enabled
    if (huggingFaceService.hasTwitterContextTraining() && source?.source === "twitter") {
      huggingFaceService.storeTweetContext(tweetId, {
        source: source.source,
        keywords: twitterApiService.getConfig().keywords,
        region: twitterApiService.getConfig().region,
        timestamp: new Date().toISOString()
      });
    }
    
    // Get LLM analysis with tweet context
    const llmAnalysis = await analyzeTweetContent(tweetContent, tweetId);
    
    // Create new tweet with enhanced analysis
    const newTweet: Tweet = {
      id: tweetId,
      name: source?.name || "Test User",
      username: source?.username || "testuser",
      profileImage: source?.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      content: tweetContent,
      timestamp: new Date().toISOString(),
      status: llmAnalysis.decision as "flagged" | "approved" | "rejected" | "pending",
      source: source?.source || "manual",
      analysis: {
        categories: llmAnalysis.categories,
        explanation: llmAnalysis.reasoning,
        detectedTopics: llmAnalysis.detectedTopics,
        policyReferences: llmAnalysis.policyReferences,
        suggestedActions: llmAnalysis.suggestedActions
      },
    };
    
    this.tweets.unshift(newTweet);
    this.notifyListeners();
    return newTweet;
  }

  // Update a tweet's status
  updateTweetStatus(tweetId: string, newStatus: "approved" | "rejected" | "flagged"): Promise<Tweet> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const tweetIndex = this.tweets.findIndex(t => t.id === tweetId);
        
        if (tweetIndex === -1) {
          reject(new Error("Tweet not found"));
          return;
        }
        
        this.tweets[tweetIndex] = {
          ...this.tweets[tweetIndex],
          status: newStatus,
        };
        
        // If Twitter context training is enabled, add this manual review as a training example
        if (huggingFaceService.hasTwitterContextTraining()) {
          const tweet = this.tweets[tweetIndex];
          huggingFaceService.addTrainingExample({
            content: tweet.content,
            label: newStatus,
            categories: tweet.analysis?.categories
              .filter(c => c.score > 0.5)
              .map(c => c.name.toLowerCase()),
            source: "twitter",
            contextData: huggingFaceService.getTweetContext(tweet.id)
          });
        }
        
        this.notifyListeners();
        resolve(this.tweets[tweetIndex]);
      }, 300);
    });
  }

  // Subscribe to changes
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners of changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

// Export a singleton instance
export const moderationService = new ModerationService();
