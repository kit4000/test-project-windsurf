import { prisma } from '../prisma/client';

// テンプレート管理サービスクラス
export class TemplateService {
  /**
   * 新しい職種テンプレートを作成する
   * @param data テンプレート作成用データ
   */
  static async createJobTemplate(data: {
    name: string;
    industryId: string;
    description?: string;
    isDefault?: boolean;
    sections: Array<{
      title: string;
      description?: string;
      promptTemplate: string;
      order: number;
      required?: boolean;
    }>;
  }) {
    try {
      // 同じ業界内でデフォルトに設定する場合は、既存のデフォルトを解除
      if (data.isDefault) {
        await prisma.jobTemplate.updateMany({
          where: {
            industryId: data.industryId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      // トランザクション内でテンプレートとセクションを作成
      return prisma.$transaction(async (tx) => {
        // テンプレートを作成
        const template = await tx.jobTemplate.create({
          data: {
            name: data.name,
            industryId: data.industryId,
            description: data.description,
            isDefault: data.isDefault ?? false,
          },
        });

        // セクションを作成
        const sectionPromises = data.sections.map((section) =>
          tx.jobTemplateSection.create({
            data: {
              title: section.title,
              description: section.description,
              promptTemplate: section.promptTemplate,
              order: section.order,
              required: section.required ?? true,
              jobTemplateId: template.id,
            },
          })
        );

        await Promise.all(sectionPromises);

        // 作成したテンプレートをセクションを含めて返す
        return tx.jobTemplate.findUnique({
          where: { id: template.id },
          include: {
            sections: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        });
      });
    } catch (error) {
      console.error('Error creating job template:', error);
      throw error;
    }
  }

  /**
   * 既存の職種テンプレートを更新する
   * @param id 更新するテンプレートのID
   * @param data 更新データ
   */
  static async updateJobTemplate(
    id: string,
    data: {
      name?: string;
      description?: string;
      isDefault?: boolean;
    }
  ) {
    try {
      // 同じ業界内でデフォルトに設定する場合は、既存のデフォルトを解除
      if (data.isDefault) {
        const template = await prisma.jobTemplate.findUnique({
          where: { id },
          select: { industryId: true },
        });

        if (template) {
          await prisma.jobTemplate.updateMany({
            where: {
              industryId: template.industryId,
              isDefault: true,
              id: { not: id },
            },
            data: {
              isDefault: false,
            },
          });
        }
      }

      // テンプレートを更新
      return prisma.jobTemplate.update({
        where: { id },
        data,
        include: {
          sections: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
    } catch (error) {
      console.error('Error updating job template:', error);
      throw error;
    }
  }

  /**
   * 職種テンプレートセクションを更新する
   * @param id 更新するセクションのID
   * @param data 更新データ
   */
  static async updateTemplateSection(
    id: string,
    data: {
      title?: string;
      description?: string;
      promptTemplate?: string;
      order?: number;
      required?: boolean;
    }
  ) {
    try {
      return prisma.jobTemplateSection.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error('Error updating template section:', error);
      throw error;
    }
  }

  /**
   * 新しいテンプレートセクションを追加する
   * @param data セクション作成データ
   */
  static async addTemplateSection(data: {
    jobTemplateId: string;
    title: string;
    description?: string;
    promptTemplate: string;
    order?: number;
    required?: boolean;
  }) {
    try {
      // 最大の順序を取得
      const maxOrderSection = await prisma.jobTemplateSection.findFirst({
        where: { jobTemplateId: data.jobTemplateId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      const order = data.order ?? (maxOrderSection ? maxOrderSection.order + 1 : 0);

      // セクションを作成
      return prisma.jobTemplateSection.create({
        data: {
          jobTemplateId: data.jobTemplateId,
          title: data.title,
          description: data.description,
          promptTemplate: data.promptTemplate,
          order,
          required: data.required ?? true,
        },
      });
    } catch (error) {
      console.error('Error adding template section:', error);
      throw error;
    }
  }

  /**
   * テンプレートセクションを削除する
   * @param id 削除するセクションのID
   */
  static async deleteTemplateSection(id: string) {
    try {
      return prisma.jobTemplateSection.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting template section:', error);
      throw error;
    }
  }

  /**
   * 職種テンプレートを削除する
   * @param id 削除するテンプレートのID
   */
  static async deleteJobTemplate(id: string) {
    try {
      // 関連するセクションは CASCADE 削除される
      return prisma.jobTemplate.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting job template:', error);
      throw error;
    }
  }

  /**
   * テンプレートを複製する
   * @param id 複製元テンプレートのID
   * @param newName 新しいテンプレート名
   */
  static async cloneJobTemplate(id: string, newName: string) {
    try {
      // 元のテンプレートとセクションを取得
      const originalTemplate = await prisma.jobTemplate.findUnique({
        where: { id },
        include: {
          sections: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

      if (!originalTemplate) {
        throw new Error('Template not found');
      }

      // トランザクション内で複製
      return prisma.$transaction(async (tx) => {
        // 新しいテンプレートを作成
        const newTemplate = await tx.jobTemplate.create({
          data: {
            name: newName,
            industryId: originalTemplate.industryId,
            description: originalTemplate.description,
            isDefault: false, // 複製は常にデフォルトではない
          },
        });

        // セクションを複製
        const sectionPromises = originalTemplate.sections.map((section) =>
          tx.jobTemplateSection.create({
            data: {
              title: section.title,
              description: section.description,
              promptTemplate: section.promptTemplate,
              order: section.order,
              required: section.required,
              jobTemplateId: newTemplate.id,
            },
          })
        );

        await Promise.all(sectionPromises);

        // 複製したテンプレートをセクションを含めて返す
        return tx.jobTemplate.findUnique({
          where: { id: newTemplate.id },
          include: {
            sections: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        });
      });
    } catch (error) {
      console.error('Error cloning job template:', error);
      throw error;
    }
  }

  /**
   * 業種に紐づく全テンプレートを取得する
   * @param industryId 業種ID
   */
  static async getTemplatesByIndustry(industryId: string) {
    try {
      return prisma.jobTemplate.findMany({
        where: { industryId },
        include: {
          sections: {
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      console.error('Error getting templates by industry:', error);
      throw error;
    }
  }

  /**
   * 業種のデフォルトテンプレートを取得する
   * @param industryId 業種ID
   */
  static async getDefaultTemplate(industryId: string) {
    try {
      return prisma.jobTemplate.findFirst({
        where: {
          industryId,
          isDefault: true,
        },
        include: {
          sections: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
    } catch (error) {
      console.error('Error getting default template:', error);
      throw error;
    }
  }
}
