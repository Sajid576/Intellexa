import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ollama } from 'ollama';

@Injectable()
export class AIService {
  private ollama: Ollama;
  private model: string;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('OLLAMA_HOST') || 'http://localhost:11434';
    this.model = this.configService.get<string>('AI_MODEL') || 'llama3';
    this.ollama = new Ollama({ host });
  }

  async generateContent(prompt: string, type: string): Promise<string> {
    try {
      const fullPrompt = `Generate a ${type} based on the following topic: ${prompt}. Return only the content text.`;
      const response = await this.ollama.generate({
        model: this.model,
        prompt: fullPrompt,
        stream: false,
      });
      return response.response;
    } catch (error: any) {
      console.error('Ollama Error:', error);
      return `[OLLAMA FALLBACK] This is a generated ${type} about: ${prompt}. (Error connecting to Ollama: ${error.message})`;
    }
  }

  async analyzeSentiment(text: string): Promise<{ score: number; label: string }> {
    try {
      const prompt = `Analyze the sentiment of the following text and return a JSON object with "score" (from -1 to 1) and "label" (Positive, Neutral, Negative). Return ONLY the JSON: "${text}"`;
      const response = await this.ollama.generate({
        model: this.model,
        prompt: prompt,
        stream: false,
      });
      
      const cleanJson = response.response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error: any) {
      console.error('Ollama Sentiment Error:', error);
      return { score: 0, label: 'Neutral (Mock)' };
    }
  }
}
