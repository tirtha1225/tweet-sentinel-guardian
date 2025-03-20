
import { Tweet } from './mockData';
import { openaiService } from './openaiService';
import { ragService, RAGService } from './ragService';

// Type definition for LLM analysis results
export interface LLMAnalysisResult {
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

// Fallback analysis for when OpenAI is not configured
const fallbackAnalysis = async (content: string): Promise<LLMAnalysisResult> => {
  console.log("Using fallback analysis system");
  
  // Simple keyword-based analysis similar to previous implementation
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
  const relevantPolicies = await getRelevantPolicies(content);
  
  // Detect topics
  const detectedTopics = await ragService.detectTopics(content);
  
  return {
    decision,
    reasoning,
    categories,
    detectedTopics,
    policyReferences: relevantPolicies,
    suggestedActions
  };
};

// Retrieves relevant policies using the RAG service
const getRelevantPolicies = async (content: string) => {
  // In a real implementation, this would use proper vector embeddings
  // and similarity search in a vector database
  const { policyKnowledgeBase } = await import('./knowledgeBase');
  
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

// The main function that analyzes tweet content with GPT-4 and RAG
export const analyzeTweetContent = async (content: string): Promise<LLMAnalysisResult> => {
  try {
    // Check if OpenAI API key is configured
    const apiKey = openaiService.getApiKey();
    if (!apiKey) {
      console.log("OpenAI API key not configured, using fallback analysis");
      return fallbackAnalysis(content);
    }
    
    // Get relevant context using RAG
    const ragContext = await ragService.getRelevantContext(content);
    
    // Create system prompt with context
    const systemPrompt = `You are an AI content moderator for a social media platform. Your task is to analyze the provided tweet content and determine if it should be approved, flagged for review, or rejected based on our content policies.

Contextual Information:
${ragContext}

Analyze the following aspects of the content:
1. Harassment or bullying
2. Hate speech or discriminatory content
3. Threats or incitement to violence
4. Misinformation that could cause harm
5. Profanity or inappropriate language
6. Self-harm or suicide content
7. Privacy violations
8. Spam or manipulative content

Provide your analysis in the following format:
- decision: Must be exactly "approved", "flagged", or "rejected"
- reasoning: A clear explanation for your decision
- categories: A list of content categories with scores (0.0-1.0) and explanations
- detectedTopics: A list of topics detected in the content
- policyReferences: Relevant policy references from the context
- suggestedActions: Suggested actions to improve the content (if applicable)

IMPORTANT: Return your response as a valid JSON object with no preamble or additional text.`;

    // Send request to OpenAI GPT-4
    const response = await openaiService.getCompletion({
      model: "gpt-4o", // Using GPT-4o, the newest model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: content }
      ],
      temperature: 0.2, // Lower temperature for more consistent results
    });
    
    // Parse and validate the GPT-4 response
    let analysis: LLMAnalysisResult;
    
    try {
      // Extract the content from the response
      const responseContent = response.choices[0].message.content;
      // Parse the JSON response
      analysis = JSON.parse(responseContent);
      
      // Validate decision is one of the allowed values
      if (!["approved", "flagged", "rejected"].includes(analysis.decision)) {
        throw new Error("Invalid decision value");
      }
      
      // Ensure all required fields are present
      if (!analysis.reasoning || !analysis.categories || !analysis.detectedTopics || !analysis.policyReferences) {
        throw new Error("Missing required fields in analysis");
      }
      
    } catch (parseError) {
      console.error("Failed to parse GPT-4 response:", parseError);
      return fallbackAnalysis(content);
    }
    
    return analysis;
    
  } catch (error) {
    console.error("Error in GPT-4 content analysis:", error);
    return fallbackAnalysis(content);
  }
};
