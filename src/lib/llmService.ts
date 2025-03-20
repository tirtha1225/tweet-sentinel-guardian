
import { Tweet } from './mockData';
import { ragService } from './ragService';
import { pipeline, env } from '@huggingface/transformers';

// Configure Hugging Face optimizations
env.useBrowserCache = true;
env.allowLocalModels = false;

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

// Class to manage Hugging Face models
class HuggingFaceService {
  private textClassificationPipeline: any = null;
  private zeroShotClassificationPipeline: any = null;
  private isLoading: boolean = false;

  // Initialize models (load lazily when needed)
  async loadModels() {
    if (this.isLoading) return;
    if (this.textClassificationPipeline && this.zeroShotClassificationPipeline) return;

    try {
      this.isLoading = true;
      console.log("Loading Hugging Face models...");

      // Load text classification model for toxicity detection
      this.textClassificationPipeline = await pipeline(
        'text-classification',
        'onnx-community/distilbert-base-uncased-finetuned-sst-2-english'
      );
      
      // Load zero-shot classification for flexible category detection
      this.zeroShotClassificationPipeline = await pipeline(
        'zero-shot-classification',
        'onnx-community/distilbert-base-uncased-distilled-squad'
      );
      
      console.log("Hugging Face models loaded successfully");
    } catch (error) {
      console.error("Error loading Hugging Face models:", error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  // Check if models are loaded
  isModelLoaded() {
    return !!this.textClassificationPipeline && !!this.zeroShotClassificationPipeline;
  }

  // Get the text classification pipeline
  async getTextClassificationPipeline() {
    await this.loadModels();
    return this.textClassificationPipeline;
  }

  // Get the zero-shot classification pipeline
  async getZeroShotClassificationPipeline() {
    await this.loadModels();
    return this.zeroShotClassificationPipeline;
  }
}

// Create singleton instance
export const huggingFaceService = new HuggingFaceService();

// Analyze content using Hugging Face models
export const analyzeTweetContent = async (content: string): Promise<LLMAnalysisResult> => {
  try {
    // Try to load Hugging Face models
    await huggingFaceService.loadModels();
    
    if (!huggingFaceService.isModelLoaded()) {
      console.log("Hugging Face models failed to load, using fallback analysis");
      return fallbackAnalysis(content);
    }
    
    // Get pipelines
    const textClassifier = await huggingFaceService.getTextClassificationPipeline();
    const zeroShotClassifier = await huggingFaceService.getZeroShotClassificationPipeline();
    
    // Perform sentiment analysis (positive/negative)
    const sentimentResult = await textClassifier(content);
    console.log("Sentiment analysis result:", sentimentResult);
    
    // Analyze content for various moderation categories
    const moderationCategories = [
      "harassment", "hate speech", "threats", "profanity", 
      "misinformation", "self-harm", "privacy violation", "spam"
    ];
    
    const categoriesResult = await zeroShotClassifier(content, moderationCategories);
    console.log("Categories analysis result:", categoriesResult);
    
    // Get relevant context using RAG
    const ragContext = await ragService.getRelevantContext(content);
    
    // Detect topics
    const detectedTopics = await ragService.detectTopics(content);
    
    // Get relevant policies
    const relevantPolicies = await getRelevantPolicies(content);
    
    // Process the results to determine moderation decision
    const negativeScore = sentimentResult[0].label === 'NEGATIVE' 
      ? sentimentResult[0].score 
      : 1 - sentimentResult[0].score;
    
    // Format categories with scores and explanations
    const categories = moderationCategories.map((name, index) => {
      const score = categoriesResult.scores[index];
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        score,
        explanation: score > 0.5 
          ? `The content may contain ${name} that requires attention.` 
          : `No significant ${name} detected in the content.`
      };
    });
    
    // Sort categories by score (highest first)
    categories.sort((a, b) => b.score - a.score);
    
    // Determine decision based on category scores and sentiment
    let decision: "approved" | "flagged" | "rejected" = "approved";
    let reasoning = "The content appears to comply with our platform policies.";
    let suggestedActions: string[] | undefined;
    
    const highestCategory = categories[0];
    
    if (highestCategory.score > 0.7) {
      decision = "rejected";
      reasoning = `The content likely contains ${highestCategory.name.toLowerCase()}, which violates our platform's policies.`;
      suggestedActions = [
        `Remove ${highestCategory.name.toLowerCase()} content`,
        "Rephrase to express ideas respectfully",
        "Focus on constructive communication"
      ];
    } else if (highestCategory.score > 0.5 || negativeScore > 0.7) {
      decision = "flagged";
      reasoning = "The content contains potentially problematic language that requires human review.";
      suggestedActions = [
        "Consider using more respectful language",
        "Focus on the topic rather than individuals",
        "Express criticism constructively"
      ];
    }
    
    return {
      decision,
      reasoning,
      categories,
      detectedTopics,
      policyReferences: relevantPolicies,
      suggestedActions
    };
    
  } catch (error) {
    console.error("Error in Hugging Face content analysis:", error);
    return fallbackAnalysis(content);
  }
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

// Fallback analysis when models fail to load
const fallbackAnalysis = async (content: string): Promise<LLMAnalysisResult> => {
  console.log("Using fallback analysis system");
  
  // Simple keyword-based analysis
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
