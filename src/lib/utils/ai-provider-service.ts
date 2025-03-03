import { prisma } from '../prisma/client';

// AIプロバイダー管理サービスクラス
export class AIProviderService {
  /**
   * 新しいAIプロバイダーを作成する
   * @param data AIプロバイダー作成用データ
   */
  static async createProvider(data: {
    name: string;
    apiKey: string;
    provider: string;
    modelName: string;
    baseUrl?: string;
    isDefault?: boolean;
    temperature?: number;
    maxTokens?: number;
  }) {
    try {
      // デフォルトに設定する場合は、既存のデフォルトを解除
      if (data.isDefault) {
        await prisma.aIProvider.updateMany({
          where: {
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      // APIキーをマスクして安全に保存（実際の実装ではより安全な方法を使用すべき）
      const apiKey = data.apiKey;

      // AIプロバイダーを作成
      return prisma.aIProvider.create({
        data: {
          name: data.name,
          apiKey: apiKey,
          provider: data.provider,
          modelName: data.modelName,
          baseUrl: data.baseUrl,
          isDefault: data.isDefault ?? false,
          temperature: data.temperature ?? 0.7,
          maxTokens: data.maxTokens ?? 4000,
        },
      });
    } catch (error) {
      console.error('Error creating AI provider:', error);
      throw error;
    }
  }

  /**
   * AIプロバイダーを更新する
   * @param id 更新するAIプロバイダーのID
   * @param data 更新データ
   */
  static async updateProvider(
    id: string,
    data: {
      name?: string;
      apiKey?: string;
      provider?: string;
      modelName?: string;
      baseUrl?: string;
      isDefault?: boolean;
      temperature?: number;
      maxTokens?: number;
    }
  ) {
    try {
      // デフォルトに設定する場合は、既存のデフォルトを解除
      if (data.isDefault) {
        await prisma.aIProvider.updateMany({
          where: {
            isDefault: true,
            id: { not: id },
          },
          data: {
            isDefault: false,
          },
        });
      }

      // APIキーが更新される場合はマスクして保存
      let apiKey = data.apiKey;
      if (apiKey && apiKey.trim() === '********') {
        // APIキーが変更されていない場合は更新しない
        delete data.apiKey;
      }

      // AIプロバイダーを更新
      return prisma.aIProvider.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error('Error updating AI provider:', error);
      throw error;
    }
  }

  /**
   * AIプロバイダーを削除する
   * @param id 削除するプロバイダーのID
   */
  static async deleteProvider(id: string) {
    try {
      // 削除するプロバイダーがデフォルトの場合は、別のプロバイダーをデフォルトに設定
      const provider = await prisma.aIProvider.findUnique({
        where: { id },
      });

      if (provider?.isDefault) {
        const anotherProvider = await prisma.aIProvider.findFirst({
          where: {
            id: { not: id },
          },
        });

        if (anotherProvider) {
          await prisma.aIProvider.update({
            where: { id: anotherProvider.id },
            data: { isDefault: true },
          });
        }
      }

      // プロバイダーを削除
      return prisma.aIProvider.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting AI provider:', error);
      throw error;
    }
  }

  /**
   * 全AIプロバイダーを取得する
   */
  static async getAllProviders() {
    try {
      return prisma.aIProvider.findMany({
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      console.error('Error getting all AI providers:', error);
      throw error;
    }
  }

  /**
   * デフォルトのAIプロバイダーを取得する
   */
  static async getDefaultProvider() {
    try {
      return prisma.aIProvider.findFirst({
        where: {
          isDefault: true,
        },
      });
    } catch (error) {
      console.error('Error getting default AI provider:', error);
      throw error;
    }
  }

  /**
   * AIプロバイダーを名前で検索する
   * @param name 検索する名前
   */
  static async searchProvidersByName(name: string) {
    try {
      return prisma.aIProvider.findMany({
        where: {
          name: {
            contains: name,
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      console.error('Error searching AI providers by name:', error);
      throw error;
    }
  }

  /**
   * プロバイダータイプで絞り込む
   * @param providerType プロバイダータイプ（'openai', 'anthropic', 'gemini'など）
   */
  static async getProvidersByType(providerType: string) {
    try {
      return prisma.aIProvider.findMany({
        where: {
          provider: providerType,
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      console.error('Error getting providers by type:', error);
      throw error;
    }
  }

  /**
   * 指定されたIDのAIプロバイダーを取得する
   * @param id プロバイダーID
   */
  static async getProviderById(id: string) {
    try {
      return prisma.aIProvider.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error('Error getting AI provider by ID:', error);
      throw error;
    }
  }

  /**
   * APIキーを検証する（実際の検証は外部APIを呼び出して行う）
   * @param provider プロバイダータイプ
   * @param apiKey 検証するAPIキー
   * @param baseUrl プロバイダーのAPIベースURL（省略可能）
   */
  static async validateApiKey(provider: string, apiKey: string, baseUrl?: string) {
    try {
      // この実装はモックです。実際のプロダクションでは適切なAPI検証を行ってください。
      switch (provider.toLowerCase()) {
        case 'openai':
          const openaiUrl = baseUrl || 'https://api.openai.com/v1';
          const openaiResponse = await fetch(`${openaiUrl}/models`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
          });
          return openaiResponse.ok;

        case 'anthropic':
          const anthropicUrl = baseUrl || 'https://api.anthropic.com/v1';
          const anthropicResponse = await fetch(`${anthropicUrl}/models`, {
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
            },
          });
          return anthropicResponse.ok;

        case 'gemini':
          // Geminiは単純なAPIキー検証エンドポイントがないため、
          // 単純なテキスト生成リクエストを送信して検証
          const geminiUrl = baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
          const testUrl = `${geminiUrl}/models/gemini-pro:generateContent?key=${apiKey}`;
          const geminiResponse = await fetch(testUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: 'Hello'
                    }
                  ]
                }
              ],
              generationConfig: {
                maxOutputTokens: 1,
              }
            }),
          });
          return geminiResponse.ok;

        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      return false;
    }
  }
}
