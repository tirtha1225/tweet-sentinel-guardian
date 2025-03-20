
import { LLMAnalysisResult } from './llmService';

// Type definitions for OpenAI API
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAICompletionParams {
  model: string;
  messages: OpenAIMessage[];
  temperature: number;
  max_tokens?: number;
}

// This service handles interactions with OpenAI API
class OpenAIService {
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('openai_api_key', key);
  }

  getApiKey(): string | null {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('openai_api_key');
    }
    return this.apiKey;
  }

  async getCompletion(params: OpenAICompletionParams): Promise<any> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw new Error('OpenAI API key not set');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OpenAI API request failed:', error);
      throw error;
    }
  }
}

// Export singleton
export const openaiService = new OpenAIService();
