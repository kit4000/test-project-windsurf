import { prisma } from '../prisma/client';

// AIプロバイダーを抽象化するインターフェース
interface AIServiceInterface {
  generateText(prompt: string, options?: Record<string, any>): Promise<string>;
}

// OpenAI APIを使用するクラス
class OpenAIService implements AIServiceInterface {
  private apiKey: string;
  private modelName: string;
  private baseUrl: string;
  private temperature: number;
  private maxTokens: number;

  constructor(apiKey: string, modelName: string, options?: {
    baseUrl?: string;
    temperature?: number;
    maxTokens?: number;
  }) {
    this.apiKey = apiKey;
    this.modelName = modelName;
    this.baseUrl = options?.baseUrl || 'https://api.openai.com/v1';
    this.temperature = options?.temperature || 0.7;
    this.maxTokens = options?.maxTokens || 4000;
  }

  async generateText(prompt: string, options?: Record<string, any>): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            {
              role: 'system',
              content: '質問内容に基づいて詳細で専門的な募集要項を作成してください。採用担当者や応募者にとって有益な情報を含めてください。'
            },
            { role: 'user', content: prompt }
          ],
          temperature: options?.temperature || this.temperature,
          max_tokens: options?.maxTokens || this.maxTokens,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }
}

// Anthropic APIを使用するクラス
class AnthropicService implements AIServiceInterface {
  private apiKey: string;
  private modelName: string;
  private baseUrl: string;
  private temperature: number;
  private maxTokens: number;

  constructor(apiKey: string, modelName: string, options?: {
    baseUrl?: string;
    temperature?: number;
    maxTokens?: number;
  }) {
    this.apiKey = apiKey;
    this.modelName = modelName;
    this.baseUrl = options?.baseUrl || 'https://api.anthropic.com/v1';
    this.temperature = options?.temperature || 0.7;
    this.maxTokens = options?.maxTokens || 4000;
  }

  async generateText(prompt: string, options?: Record<string, any>): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.modelName,
          system: '質問内容に基づいて詳細で専門的な募集要項を作成してください。採用担当者や応募者にとって有益な情報を含めてください。',
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: options?.temperature || this.temperature,
          max_tokens: options?.maxTokens || this.maxTokens,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Anthropic API Error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.content[0]?.text || '';
    } catch (error) {
      console.error('Anthropic API Error:', error);
      throw error;
    }
  }
}

// Google Gemini APIを使用するクラス
class GeminiService implements AIServiceInterface {
  private apiKey: string;
  private modelName: string;
  private baseUrl: string;
  private temperature: number;
  private maxTokens: number;

  constructor(apiKey: string, modelName: string, options?: {
    baseUrl?: string;
    temperature?: number;
    maxTokens?: number;
  }) {
    this.apiKey = apiKey;
    this.modelName = modelName;
    this.baseUrl = options?.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
    this.temperature = options?.temperature || 0.7;
    this.maxTokens = options?.maxTokens || 4000;
  }

  async generateText(prompt: string, options?: Record<string, any>): Promise<string> {
    try {
      const url = `${this.baseUrl}/models/${this.modelName}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `質問内容に基づいて詳細で専門的な募集要項を作成してください。採用担当者や応募者にとって有益な情報を含めてください。\n\n${prompt}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: options?.temperature || this.temperature,
            maxOutputTokens: options?.maxTokens || this.maxTokens,
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini API Error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || '';
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }
}

// AIサービスファクトリクラス
export class AIServiceFactory {
  static async createService(providerId?: string): Promise<AIServiceInterface> {
    try {
      // プロバイダーIDが指定されていない場合はデフォルトのプロバイダーを使用
      const provider = providerId 
        ? await prisma.aIProvider.findUnique({ where: { id: providerId } })
        : await prisma.aIProvider.findFirst({ where: { isDefault: true } });

      if (!provider) {
        throw new Error('AI Provider not found');
      }

      const options = {
        baseUrl: provider.baseUrl,
        temperature: provider.temperature,
        maxTokens: provider.maxTokens,
      };

      switch (provider.provider.toLowerCase()) {
        case 'openai':
          return new OpenAIService(provider.apiKey, provider.modelName, options);
        case 'anthropic':
          return new AnthropicService(provider.apiKey, provider.modelName, options);
        case 'gemini':
          return new GeminiService(provider.apiKey, provider.modelName, options);
        default:
          throw new Error(`Unsupported AI provider: ${provider.provider}`);
      }
    } catch (error) {
      console.error('Error creating AI service:', error);
      throw error;
    }
  }
}
