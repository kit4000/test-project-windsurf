import { NextRequest, NextResponse } from 'next/server';
import { TemplateService } from '@/lib/utils/template-service';
import { CreateJobTemplateRequest } from '@/types/job-description';

// すべてのテンプレートを取得またはフィルタリング
export async function GET(request: NextRequest) {
  try {
    // クエリパラメータの取得
    const searchParams = request.nextUrl.searchParams;
    const industryId = searchParams.get('industryId');
    
    if (!industryId) {
      return NextResponse.json(
        { error: 'Industry ID is required' },
        { status: 400 }
      );
    }

    // 業種に紐づくテンプレートを取得
    const templates = await TemplateService.getTemplatesByIndustry(industryId);

    // レスポンスを返す
    return NextResponse.json({ templates }, { status: 200 });
  } catch (error) {
    console.error('Error fetching job templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job templates' },
      { status: 500 }
    );
  }
}

// 新しいテンプレートを作成
export async function POST(request: NextRequest) {
  try {
    const body: CreateJobTemplateRequest = await request.json();

    // 必須項目のバリデーション
    if (!body.name || !body.industryId || !body.sections || body.sections.length === 0) {
      return NextResponse.json(
        { error: 'Name, industry ID, and at least one section are required' },
        { status: 400 }
      );
    }

    // セクションのバリデーション
    for (const section of body.sections) {
      if (!section.title || !section.promptTemplate) {
        return NextResponse.json(
          { error: 'Section title and prompt template are required for all sections' },
          { status: 400 }
        );
      }
    }

    // テンプレートを作成
    const template = await TemplateService.createJobTemplate({
      name: body.name,
      industryId: body.industryId,
      description: body.description,
      isDefault: body.isDefault,
      sections: body.sections.map((section, index) => ({
        title: section.title,
        description: section.description,
        promptTemplate: section.promptTemplate,
        order: section.order !== undefined ? section.order : index,
        required: section.required,
      })),
    });

    // レスポンスを返す
    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Error creating job template:', error);
    return NextResponse.json(
      { error: 'Failed to create job template' },
      { status: 500 }
    );
  }
}

// デフォルトテンプレートを取得するエンドポイント
export async function HEAD(request: NextRequest) {
  try {
    // クエリパラメータの取得
    const searchParams = request.nextUrl.searchParams;
    const industryId = searchParams.get('industryId');
    
    if (!industryId) {
      return NextResponse.json(
        { error: 'Industry ID is required' },
        { status: 400 }
      );
    }

    // 業種のデフォルトテンプレートを取得
    const template = await TemplateService.getDefaultTemplate(industryId);

    if (!template) {
      return NextResponse.json(
        { error: 'Default template not found for this industry' },
        { status: 404 }
      );
    }

    // レスポンスを返す
    return NextResponse.json({ template }, { status: 200 });
  } catch (error) {
    console.error('Error fetching default template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch default template' },
      { status: 500 }
    );
  }
}
