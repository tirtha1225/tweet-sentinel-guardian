
import { Tweet } from './mockData';
import { ragService } from './ragService';
import { pipeline, env } from '@huggingface/transformers';
import { twitterApiService } from './twitterApiService';

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

// Sample training data for model fine-tuning
export interface TrainingExample {
  content: string;
  label: "approved" | "flagged" | "rejected";
  categories?: string[];
  source?: "manual" | "twitter" | "csv";
  contextData?: {
    timestamp?: string;
    keywords?: string[];
    region?: string;
    tweetMetadata?: any;
  };
}

// Class to manage Hugging Face models
class HuggingFaceService {
  private textClassificationPipeline: any = null;
  private zeroShotClassificationPipeline: any = null;
  private isLoading: boolean = false;
  private trainingData: TrainingExample[] = [];
  private modelTrained: boolean = false;
  private trainingInProgress: boolean = false;
  private trainingProgress: number = 0;
  private twitterContextTrainingEnabled: boolean = false;
  private tweetContextData: Map<string, any> = new Map();

  constructor() {
    // Subscribe to Twitter context training status changes
    twitterApiService.subscribeToContextTrainingStatus((enabled) => {
      this.twitterContextTrainingEnabled = enabled;
      console.log(`Twitter context training ${enabled ? 'enabled' : 'disabled'}`);
    });
    
    // Initialize with current status
    this.twitterContextTrainingEnabled = twitterApiService.isContextTrainingEnabled();
  }

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

  // Add training data
  addTrainingExample(example: TrainingExample) {
    // Enrich with Twitter context if available and it's from Twitter
    if (example.source === 'twitter' && this.twitterContextTrainingEnabled) {
      example.contextData = {
        ...example.contextData,
        keywords: twitterApiService.getConfig().keywords,
        region: twitterApiService.getConfig().region,
        timestamp: new Date().toISOString()
      };
    }
    
    this.trainingData.push(example);
    console.log(`Added training example: "${example.content.substring(0, 30)}..." with label ${example.label}`);
    return this.trainingData.length;
  }

  // Add multiple training examples at once
  addTrainingExamples(examples: TrainingExample[]) {
    // Enrich with Twitter context if enabled
    if (this.twitterContextTrainingEnabled) {
      examples = examples.map(example => {
        if (!example.contextData) {
          example.contextData = {
            keywords: twitterApiService.getConfig().keywords,
            region: twitterApiService.getConfig().region,
            timestamp: new Date().toISOString()
          };
        }
        return example;
      });
    }
    
    this.trainingData = [...this.trainingData, ...examples];
    console.log(`Added ${examples.length} training examples. Total: ${this.trainingData.length}`);
    return this.trainingData.length;
  }

  // Store tweet context data
  storeTweetContext(tweetId: string, contextData: any) {
    if (this.twitterContextTrainingEnabled) {
      this.tweetContextData.set(tweetId, {
        ...contextData,
        timestamp: new Date().toISOString(),
        keywords: twitterApiService.getConfig().keywords,
        region: twitterApiService.getConfig().region
      });
      console.log(`Stored context data for tweet ${tweetId}`);
    }
  }

  // Get tweet context data
  getTweetContext(tweetId: string) {
    return this.tweetContextData.get(tweetId);
  }

  // Check if Twitter context training is enabled
  hasTwitterContextTraining() {
    return this.twitterContextTrainingEnabled;
  }

  // Enable Twitter context training
  enableTwitterContextTraining() {
    twitterApiService.setContextTrainingEnabled(true);
    this.twitterContextTrainingEnabled = true;
  }

  // Disable Twitter context training
  disableTwitterContextTraining() {
    twitterApiService.setContextTrainingEnabled(false);
    this.twitterContextTrainingEnabled = false;
  }

  // Clear training data
  clearTrainingData() {
    this.trainingData = [];
    this.tweetContextData.clear();
    console.log("Training data cleared");
    return true;
  }

  // Get training data
  getTrainingData() {
    return [...this.trainingData];
  }

  // Check if the model has been trained
  isModelTrained() {
    return this.modelTrained;
  }

  // Check if training is in progress
  isTrainingInProgress() {
    return this.trainingInProgress;
  }

  // Get training progress (0-100%)
  getTrainingProgress() {
    return this.trainingProgress;
  }

  // Train the model with the collected examples
  async trainModel() {
    if (this.trainingInProgress) {
      throw new Error("Training already in progress");
    }

    if (this.trainingData.length < 5) {
      throw new Error("Not enough training data. Please add at least 5 examples.");
    }

    try {
      this.trainingInProgress = true;
      this.trainingProgress = 0;

      console.log(`Starting model training with ${this.trainingData.length} examples...`);
      
      if (this.twitterContextTrainingEnabled) {
        console.log("Twitter context training is enabled. Enriching training data with context.");
        // In a real implementation, we would use the context data for more nuanced training
      }

      // Simulate training progress
      for (let i = 1; i <= 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        this.trainingProgress = i * 10;
        console.log(`Training progress: ${this.trainingProgress}%`);
      }

      // After "training", store the examples as reference data
      this.modelTrained = true;
      console.log("Model training completed");

      return true;
    } catch (error) {
      console.error("Error during model training:", error);
      throw error;
    } finally {
      this.trainingInProgress = false;
      this.trainingProgress = 0;
    }
  }
}

// Export singleton instance
export const huggingFaceService = new HuggingFaceService();

// Analyze content using Hugging Face models
export const analyzeTweetContent = async (content: string, tweetId?: string): Promise<LLMAnalysisResult> => {
  try {
    // Try to load Hugging Face models
    await huggingFaceService.loadModels();
    
    if (!huggingFaceService.isModelLoaded()) {
      console.log("Hugging Face models failed to load, using fallback analysis");
      return fallbackAnalysis(content);
    }
    
    // Get tweet context if available and Twitter context training is enabled
    const tweetContext = tweetId ? huggingFaceService.getTweetContext(tweetId) : null;
    if (tweetContext && huggingFaceService.hasTwitterContextTraining()) {
      console.log("Using tweet context for analysis:", tweetContext);
      // In a real implementation, we would use the context to inform the analysis
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
    
    // If we have the tweet context and Twitter context training is enabled, store analysis result
    if (tweetId && huggingFaceService.hasTwitterContextTraining()) {
      // Store the analysis with the tweet context for future training
      const trainingExample: TrainingExample = {
        content,
        label: decision,
        categories: categories.filter(c => c.score > 0.5).map(c => c.name.toLowerCase()),
        source: 'twitter',
        contextData: huggingFaceService.getTweetContext(tweetId)
      };
      
      // Add to training data automatically if enabled
      huggingFaceService.addTrainingExample(trainingExample);
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
  
  // Enhanced keyword-based analysis with more comprehensive profanity and hate speech detection
  const profanityWords = [
    'damn', 'hell', 'ass', 'bitch', 'shit', 'fuck', 'crap', 'bastard', 
    'whore', 'slut', 'dick', 'pussy', 'asshole', 'motherfucker'
  ];
  
  const hateWords = [
    'hate', 'stupid', 'idiot', 'dumb', 'moron', 'retard', 'loser', 
    'ugly', 'fat', 'kill', 'die', 'attack', 'worthless', 'useless'
  ];
  
  const slurs = [
    'nigger', 'nigga', 'faggot', 'fag', 'dyke', 'tranny', 'chink', 
    'spic', 'wetback', 'kike', 'gook', 'raghead', 'towelhead', 'paki'
  ];
  
  // Check for presence of any profanity or hate speech
  const containsProfanity = profanityWords.some(word => 
    content.toLowerCase().includes(word.toLowerCase()) || 
    new RegExp(`\\b${word}\\b`, 'i').test(content)
  );
  
  const containsHateSpeech = hateWords.some(word => 
    content.toLowerCase().includes(word.toLowerCase()) || 
    new RegExp(`\\b${word}\\b`, 'i').test(content)
  );
  
  const containsSlurs = slurs.some(word => 
    content.toLowerCase().includes(word.toLowerCase()) || 
    new RegExp(`\\b${word}\\b`, 'i').test(content)
  );
  
  const containsThreat = content.toLowerCase().includes('kill') || 
                        content.toLowerCase().includes('destroy') || 
                        content.toLowerCase().includes('hurt') ||
                        content.toLowerCase().includes('die') ||
                        content.toLowerCase().includes('murder') ||
                        content.toLowerCase().includes('attack');

  // Determine severity levels for different types of content issues
  const profanityScore = containsProfanity ? 0.7 : 0.1;
  const hateSpeechScore = containsHateSpeech ? 0.75 : 0.2;
  const slurScore = containsSlurs ? 0.95 : 0;
  const threatScore = containsThreat ? 0.9 : 0.1;
  
  // Determine categories with scores and explanations
  const categories = [
    { 
      name: "Hate Speech", 
      score: Math.max(hateSpeechScore, slurScore),
      explanation: (hateSpeechScore > 0.5 || slurScore > 0) 
        ? "The content contains language that may be targeting specific groups or individuals in a derogatory way." 
        : "No significant hate speech detected in the content."
    },
    { 
      name: "Profanity", 
      score: profanityScore,
      explanation: containsProfanity 
        ? "The content contains words that are considered profane or inappropriate." 
        : "No significant profanity detected in the content."
    },
    { 
      name: "Threats", 
      score: threatScore,
      explanation: containsThreat 
        ? "The content contains language that could be interpreted as threatening violence." 
        : "No threatening language detected in the content."
    }
  ];
  
  // Sort categories by score (highest first)
  categories.sort((a, b) => b.score - a.score);
  
  // Decision logic with stricter thresholds
  let decision: "approved" | "flagged" | "rejected";
  let reasoning: string;
  let suggestedActions: string[] | undefined;
  
  if (containsSlurs || threatScore > 0.8) {
    decision = "rejected";
    reasoning = "The content contains language that violates our platform's community guidelines, such as slurs or threatening content.";
    suggestedActions = [
      "Remove offensive language",
      "Rephrase to express disagreement respectfully",
      "Focus on constructive criticism rather than personal attacks"
    ];
  } else if (profanityScore > 0.6 || hateSpeechScore > 0.6) {
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

// Sample training dataset with example tweets and their labels
export const sampleTrainingData: TrainingExample[] = [
  {
    content: "I love this new product! It works beautifully and the customer service was excellent.",
    label: "approved",
    categories: ["positive"]
  },
  {
    content: "I'm disappointed with my purchase. It broke after just one week.",
    label: "approved",
    categories: ["negative"]
  },
  {
    content: "This company is a scam and everyone should avoid them!",
    label: "flagged",
    categories: ["negative"]
  },
  {
    content: "I hate you all and wish you would disappear.",
    label: "rejected",
    categories: ["harassment"]
  },
  {
    content: "If I see you again I'm going to hurt you.",
    label: "rejected",
    categories: ["threats", "harassment"]
  },
  {
    content: "The government is putting mind control chips in vaccines.",
    label: "flagged",
    categories: ["misinformation"]
  },
  {
    content: "Great discussion yesterday about climate policies.",
    label: "approved",
    categories: ["positive"]
  },
  {
    content: "The meeting has been rescheduled to next Monday at 10am.",
    label: "approved",
    categories: ["neutral"]
  },
  {
    content: "Click here to win a free iPhone! Just enter your credit card details.",
    label: "rejected",
    categories: ["spam", "scam"]
  },
  {
    content: "Your account has been compromised. Click here to reset your password.",
    label: "rejected",
    categories: ["spam", "scam"]
  }
];
