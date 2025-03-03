// AIプロバイダー関連の型

export type AIProviderType = 'openai' | 'anthropic' | 'gemini' | string;

export interface AIProvider {
  id: string;
  name: string;
  provider: AIProviderType;
  modelName: string;
  baseUrl?: string;
  isDefault: boolean;
  temperature: number;
  maxTokens: number;
  apiKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAIProviderRequest {
  name: string;
  provider: AIProviderType;
  modelName: string;
  baseUrl?: string;
  apiKey: string;
  isDefault?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface UpdateAIProviderRequest {
  name?: string;
  provider?: AIProviderType;
  modelName?: string;
  baseUrl?: string;
  apiKey?: string;
  isDefault?: boolean;
  temperature?: number;
  maxTokens?: number;
}

// テンプレート関連の型

export interface JobTemplateSection {
  id: string;
  title: string;
  description?: string;
  promptTemplate: string;
  order: number;
  required: boolean;
  jobTemplateId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobTemplate {
  id: string;
  name: string;
  industryId: string;
  description?: string;
  isDefault: boolean;
  sections: JobTemplateSection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJobTemplateRequest {
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
}

export interface UpdateJobTemplateRequest {
  name?: string;
  description?: string;
  isDefault?: boolean;
}

export interface CreateTemplateSectionRequest {
  jobTemplateId: string;
  title: string;
  description?: string;
  promptTemplate: string;
  order?: number;
  required?: boolean;
}

export interface UpdateTemplateSectionRequest {
  title?: string;
  description?: string;
  promptTemplate?: string;
  order?: number;
  required?: boolean;
}

// 募集要項関連の型

export interface JobDescriptionSection {
  id: string;
  content: string;
  templateSectionId: string;
  templateSection: JobTemplateSection;
  jobDescriptionId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobDescription {
  id: string;
  title: string;
  jobTemplateId: string;
  jobTemplate: JobTemplate;
  sessionId?: string;
  sections: JobDescriptionSection[];
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJobDescriptionRequest {
  title: string;
  sessionId: string;
  jobTemplateId: string;
  aiProviderId?: string;
}

export interface UpdateJobDescriptionSectionRequest {
  content: string;
}

export interface RegenerateJobDescriptionRequest {
  aiProviderId?: string;
}

export interface UpdateJobDescriptionStatusRequest {
  status: 'draft' | 'published';
}
