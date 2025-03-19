
import { Tweet, mockTweets } from './mockData';

// This would typically connect to an API or backend service
// For demo purposes, we'll use the mock data

class ModerationService {
  private tweets: Tweet[] = [...mockTweets];
  private listeners: Array<() => void> = [];

  // Get all tweets
  getAllTweets(): Tweet[] {
    return [...this.tweets];
  }

  // Get tweets by status
  getTweetsByStatus(status: string): Tweet[] {
    return this.tweets.filter(tweet => tweet.status === status);
  }

  // Process a new tweet
  processTweet(tweetContent: string): Promise<Tweet> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate AI processing
        const isNegative = tweetContent.includes('bad') || 
                          tweetContent.includes('hate') || 
                          tweetContent.includes('terrible');
        
        const containsProfanity = tweetContent.includes('damn') || 
                                  tweetContent.includes('hell');
        
        const containsThreat = tweetContent.includes('kill') || 
                              tweetContent.includes('destroy') || 
                              tweetContent.includes('hurt');
        
        // Determine status based on content
        let status: "flagged" | "approved" | "rejected" | "pending" = "approved";
        
        if (containsThreat) {
          status = "rejected";
        } else if (isNegative || containsProfanity) {
          status = "flagged";
        }
        
        // Create new tweet
        const newTweet: Tweet = {
          id: `tweet-${Date.now()}`,
          name: "Test User",
          username: "testuser",
          profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
          content: tweetContent,
          timestamp: new Date().toISOString(),
          status,
          analysis: {
            categories: [
              { name: "Harassment", score: isNegative ? 0.6 : 0.1 },
              { name: "Negativity", score: isNegative ? 0.75 : 0.05 },
              { name: "Profanity", score: containsProfanity ? 0.8 : 0.02 },
              { name: "Threats", score: containsThreat ? 0.9 : 0.01 },
            ],
          },
        };
        
        this.tweets.unshift(newTweet);
        this.notifyListeners();
        resolve(newTweet);
      }, 1000); // Simulate processing delay
    });
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
