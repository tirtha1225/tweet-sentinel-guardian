
// This is now a stub implementation that logs messages when the API would be used
// The application now uses Hugging Face models instead of OpenAI

class OpenAIService {
  getApiKey(): string | null {
    console.log("OpenAI API is not being used. The application now uses Hugging Face models.");
    return null;
  }

  setApiKey(key: string) {
    console.log("OpenAI API is not being used. The application now uses Hugging Face models.");
  }

  async getCompletion(params: any): Promise<any> {
    console.log("OpenAI API is not being used. The application now uses Hugging Face models.");
    throw new Error('OpenAI API is not available. The application now uses Hugging Face models.');
  }
}

// Export singleton
export const openaiService = new OpenAIService();
