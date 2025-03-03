import { prisma } from '../prisma/client';
import { AIServiceFactory } from './ai-service';

// 募集要項生成サービスクラス
export class JobDescriptionService {
  /**
   * ヒアリングセッションに基づいて募集要項を生成する
   * @param sessionId ヒアリングセッションID
   * @param jobTemplateId 職種テンプレートID
   * @param title 募集要項のタイトル
   * @param aiProviderId AI プロバイダーID (省略可能)
   * @returns 生成された募集要項
   */
  static async generateFromSession(
    sessionId: string,
    jobTemplateId: string,
    title: string,
    aiProviderId?: string
  ) {
    try {
      // セッションとテンプレートの情報を取得
      const session = await prisma.hearingSession.findUnique({
        where: { id: sessionId },
        include: {
          responses: {
            include: {
              hearingItem: true,
            },
          },
        },
      });

      if (!session) {
        throw new Error('Hearing session not found');
      }

      const jobTemplate = await prisma.jobTemplate.findUnique({
        where: { id: jobTemplateId },
        include: {
          sections: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

      if (!jobTemplate) {
        throw new Error('Job template not found');
      }

      // AIサービスを初期化
      const aiService = await AIServiceFactory.createService(aiProviderId);

      // 新しい募集要項を作成
      const jobDescription = await prisma.jobDescription.create({
        data: {
          title,
          jobTemplateId,
          sessionId,
          status: 'draft',
        },
      });

      // ヒアリング内容を整形
      const hearingData = session.responses.map(response => {
        return {
          question: response.hearingItem.question,
          answer: response.answer,
        };
      });

      // 各セクションごとにAIで内容を生成
      const sectionPromises = jobTemplate.sections.map(async (section) => {
        // プロンプトテンプレートに値を入れ込む
        let prompt = section.promptTemplate;
        
        // プロンプトにヒアリング内容を追加
        prompt += `\n\n【ヒアリング内容】\n`;
        hearingData.forEach(item => {
          prompt += `質問: ${item.question}\n回答: ${item.answer}\n\n`;
        });

        // AIを使って内容を生成
        const content = await aiService.generateText(prompt);

        // セクションを保存
        return prisma.jobDescriptionSection.create({
          data: {
            content,
            templateSectionId: section.id,
            jobDescriptionId: jobDescription.id,
            order: section.order,
          },
        });
      });

      // 全セクションの生成が完了するのを待つ
      await Promise.all(sectionPromises);

      // 生成された募集要項を取得して返す
      return prisma.jobDescription.findUnique({
        where: { id: jobDescription.id },
        include: {
          sections: {
            include: {
              templateSection: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
          jobTemplate: true,
        },
      });
    } catch (error) {
      console.error('Error generating job description:', error);
      throw error;
    }
  }

  /**
   * 募集要項セクションの内容を更新する
   * @param sectionId 更新するセクションのID
   * @param content 新しい内容
   * @returns 更新されたセクション
   */
  static async updateSection(sectionId: string, content: string) {
    try {
      return prisma.jobDescriptionSection.update({
        where: { id: sectionId },
        data: { content },
        include: {
          templateSection: true,
        },
      });
    } catch (error) {
      console.error('Error updating job description section:', error);
      throw error;
    }
  }

  /**
   * 募集要項を再生成する
   * @param jobDescriptionId 募集要項ID
   * @param aiProviderId AI プロバイダーID (省略可能)
   */
  static async regenerateDescription(jobDescriptionId: string, aiProviderId?: string) {
    try {
      // 既存の募集要項を取得
      const existingDescription = await prisma.jobDescription.findUnique({
        where: { id: jobDescriptionId },
        include: {
          sections: {
            include: {
              templateSection: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
          hearingSession: {
            include: {
              responses: {
                include: {
                  hearingItem: true,
                },
              },
            },
          },
        },
      });

      if (!existingDescription || !existingDescription.hearingSession) {
        throw new Error('Job description or hearing session not found');
      }

      // AIサービスを初期化
      const aiService = await AIServiceFactory.createService(aiProviderId);

      // ヒアリング内容を整形
      const hearingData = existingDescription.hearingSession.responses.map(response => {
        return {
          question: response.hearingItem.question,
          answer: response.answer,
        };
      });

      // 各セクションごとに再生成
      const updatePromises = existingDescription.sections.map(async (section) => {
        // プロンプトテンプレートに値を入れ込む
        let prompt = section.templateSection.promptTemplate;
        
        // プロンプトにヒアリング内容を追加
        prompt += `\n\n【ヒアリング内容】\n`;
        hearingData.forEach(item => {
          prompt += `質問: ${item.question}\n回答: ${item.answer}\n\n`;
        });

        // AIを使って内容を生成
        const content = await aiService.generateText(prompt);

        // セクションを更新
        return prisma.jobDescriptionSection.update({
          where: { id: section.id },
          data: { content },
        });
      });

      // 全セクションの再生成が完了するのを待つ
      await Promise.all(updatePromises);

      // 更新された募集要項を取得して返す
      return prisma.jobDescription.findUnique({
        where: { id: jobDescriptionId },
        include: {
          sections: {
            include: {
              templateSection: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
          jobTemplate: true,
        },
      });
    } catch (error) {
      console.error('Error regenerating job description:', error);
      throw error;
    }
  }

  /**
   * 募集要項の公開ステータスを更新する
   * @param jobDescriptionId 募集要項ID
   * @param status 新しいステータス ('draft' または 'published')
   */
  static async updateStatus(jobDescriptionId: string, status: 'draft' | 'published') {
    try {
      return prisma.jobDescription.update({
        where: { id: jobDescriptionId },
        data: { status },
      });
    } catch (error) {
      console.error('Error updating job description status:', error);
      throw error;
    }
  }
}
