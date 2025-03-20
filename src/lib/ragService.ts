
import { policyKnowledgeBase } from './knowledgeBase';

// Simple Vector search simulation for RAG
export class RAGService {
  // Retrieves relevant context based on input text
  async getRelevantContext(text: string): Promise<string> {
    // In a real implementation, this would use vector embeddings and similarity search
    // For now, we'll use keyword matching as a simple simulation
    
    const relevantPolicies = policyKnowledgeBase
      .map(policy => {
        // Calculate relevance score based on keyword matches
        const relevanceScore = policy.keywords.reduce((score, keyword) => {
          return text.toLowerCase().includes(keyword.toLowerCase()) 
            ? score + 0.2 
            : score;
        }, 0);
        
        return {
          policy,
          relevance: Math.min(relevanceScore, 1)
        };
      })
      .filter(item => item.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3); // Get top 3 most relevant policies
    
    if (relevantPolicies.length === 0) {
      return "No specific policy guidelines found for this content.";
    }
    
    // Format the relevant policies into a string context
    return relevantPolicies.map(item => 
      `Policy: ${item.policy.name}\nDescription: ${item.policy.description}\nRelevance: ${Math.round(item.policy.relevance * 100)}%`
    ).join('\n\n');
  }
  
  // Analyzes content topics
  async detectTopics(text: string): Promise<string[]> {
    // In a production version, this would use a topic classification model
    // For now we'll use a simple keyword-based approach
    const topics = [];
    
    const topicKeywords: Record<string, string[]> = {
      "Politics": ["politic", "government", "election", "democrat", "republican", "congress", "senate"],
      "Technology": ["tech", "computer", "software", "hardware", "programming", "ai", "algorithm"],
      "Entertainment": ["movie", "film", "music", "celebrity", "actor", "actress", "hollywood"],
      "Sports": ["sport", "game", "team", "player", "championship", "league", "score"],
      "Health": ["health", "medical", "doctor", "disease", "patient", "hospital", "treatment"],
      "Finance": ["finance", "money", "bank", "investment", "stock", "market", "economy"]
    };
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()))) {
        topics.push(topic);
      }
    }
    
    return topics;
  }
}

// Export singleton instance
export const ragService = new RAGService();
