
import { Tweet } from './mockData';

// This would connect to an actual LLM API in production
// For demo purposes, we'll simulate LLM responses

interface LLMAnalysisResult {
  decision: "approved" | "flagged" | "rejected";
  reasoning: string;
  categories: {
    name: string;
    score: number;
    explanation: string;
  }[];
  detectedTopics: string[];
  policyReferences: {
    policyName: string;
    relevance: number;
    description: string;
  }[];
  suggestedActions?: string[];
}

// Simulated knowledge base for RAG
const policyKnowledgeBase = [
  {
    id: "policy-1",
    name: "Harassment Policy",
    description: "Content targeting individuals with intent to harm, bully, or belittle is not allowed.",
    keywords: ["harass", "bully", "attack", "insult", "hate"]
  },
  {
    id: "policy-2",
    name: "Profanity Policy",
    description: "Excessive or targeted profanity that creates a hostile environment is moderated.",
    keywords: ["damn", "hell", "profanity", "swear"]
  },
  {
    id: "policy-3",
    name: "Threat Policy",
    description: "Direct or indirect threats of violence are strictly prohibited.",
    keywords: ["kill", "hurt", "destroy", "threat", "violence", "attack"]
  },
  {
    id: "policy-4",
    name: "Misinformation Policy",
    description: "Content that deliberately spreads false information that could cause harm.",
    keywords: ["fake", "lie", "untrue", "conspiracy", "hoax"]
  }
];

// Simple RAG simulation - in production this would use vector embeddings and similarity search
const retrieveRelevantPolicies = (content: string) => {
  const relevantPolicies = policyKnowledgeBase
    .map(policy => {
      const relevanceScore = policy.keywords.reduce((score, keyword) => {
        return content.toLowerCase().includes(keyword.toLowerCase()) 
          ? score + 0.2 
          : score;
      }, 0);
      
      return {
        policyName: policy.name,
        relevance: Math.min(relevanceScore, 1),
        description: policy.description
      };
    })
    .filter(policy => policy.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance);
  
  return relevantPolicies;
};

// Simulates an LLM response for content analysis
export const analyzeTweetContent = (content: string): Promise<LLMAnalysisResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // This simulates LLM analysis - in production this would call an actual LLM API
      const containsHarassment = content.toLowerCase().includes('bad') || 
                                content.toLowerCase().includes('hate');
      
      const containsProfanity = content.toLowerCase().includes('damn') || 
                               content.toLowerCase().includes('hell');
      
      const containsThreat = content.toLowerCase().includes('kill') || 
                            content.toLowerCase().includes('destroy') || 
                            content.toLowerCase().includes('hurt');

      const isNegative = containsHarassment || containsProfanity || containsThreat;
      
      // Determine categories with scores and explanations
      const categories = [
        { 
          name: "Harassment", 
          score: containsHarassment ? 0.8 : 0.1,
          explanation: containsHarassment 
            ? "The content contains language that appears to be targeting others in a negative way." 
            : "No significant harassment detected in the content."
        },
        { 
          name: "Negativity", 
          score: isNegative ? 0.75 : 0.2,
          explanation: isNegative 
            ? "The overall tone of the content is negative, which may create an unwelcoming environment." 
            : "The content maintains a generally neutral or positive tone."
        },
        { 
          name: "Profanity", 
          score: containsProfanity ? 0.7 : 0.05,
          explanation: containsProfanity 
            ? "The content contains words that may be considered profane or inappropriate." 
            : "No significant profanity detected in the content."
        },
        { 
          name: "Threats", 
          score: containsThreat ? 0.9 : 0.01,
          explanation: containsThreat 
            ? "The content contains language that could be interpreted as threatening violence." 
            : "No threatening language detected in the content."
        }
      ];
      
      // Decision logic
      let decision: "approved" | "flagged" | "rejected";
      let reasoning: string;
      let suggestedActions: string[] | undefined;
      
      if (containsThreat) {
        decision = "rejected";
        reasoning = "The content contains language that may be interpreted as threatening, which violates our platform's safety policies.";
        suggestedActions = [
          "Remove threatening language",
          "Rephrase to express disagreement respectfully",
          "Focus on constructive criticism rather than personal attacks"
        ];
      } else if (containsHarassment || containsProfanity) {
        decision = "flagged";
        reasoning = "The content contains potentially harmful language that requires human review to determine if it violates platform policies.";
        suggestedActions = [
          "Consider using more respectful language",
          "Focus on the topic rather than individuals",
          "Express criticism constructively"
        ];
      } else {
        decision = "approved";
        reasoning = "The content appears to comply with our platform policies and has been approved.";
      }
      
      // Get relevant policies using RAG
      const policyReferences = retrieveRelevantPolicies(content);
      
      // Extract potential topics (simplified)
      const detectedTopics = [];
      if (content.toLowerCase().includes("politic")) detectedTopics.push("Politics");
      if (content.toLowerCase().includes("game")) detectedTopics.push("Gaming");
      if (content.toLowerCase().includes("food")) detectedTopics.push("Food");
      if (content.toLowerCase().includes("movie") || content.toLowerCase().includes("film")) detectedTopics.push("Entertainment");
      if (content.toLowerCase().includes("tech") || content.toLowerCase().includes("computer")) detectedTopics.push("Technology");
      
      resolve({
        decision,
        reasoning,
        categories,
        detectedTopics,
        policyReferences,
        suggestedActions
      });
    }, 1000); // Simulate processing time
  });
};

export type { LLMAnalysisResult };
