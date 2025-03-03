import { NextRequest, NextResponse } from 'next/server';
import { TemplateService } from '@/lib/utils/template-service';
import { CreateTemplateSectionRequest } from '@/types/job-description';
import { prisma } from '@/lib/prisma/client';

interface RouteParams {
  params: {
    id: string;
  };
}

// テンプレートのセクション一覧を取得
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // テンプレートが存在するか確認
    const template = await prisma.jobTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Job template not found' },
        { status: 404 }
      );
    }

    // セクションを取得
    const sections = await prisma.jobTemplateSection.findMany({
      where: { jobTemplateId: id },
      orderBy: {
        order: 'asc',
      },
    });

    // レスポンスを返す
    return NextResponse.json({ sections }, { status: 200 });
  } catch (error) {
    console.error('Error fetching template sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template sections' },
      { status: 500 }
    );
  }
}

// 新しいセクションを追加
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: templateId } = params;
    const body: CreateTemplateSectionRequest = await request.json();

    // テンプレートが存在するか確認
    const template = await prisma.jobTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Job template not found' },
        { status: 404 }
      );
    }

    // 必須項目のバリデーション
    if (!body.title || !body.promptTemplate) {
      return NextResponse.json(
        { error: 'Title and prompt template are required' },
        { status: 400 }
      );
    }

    // セクションを作成
    const section = await TemplateService.addTemplateSection({
      jobTemplateId: templateId,
      title: body.title,
      description: body.description,
      promptTemplate: body.promptTemplate,
      order: body.order,
      required: body.required,
    });

    // レスポンスを返す
    return NextResponse.json({ section }, { status: 201 });
  } catch (error) {
    console.error('Error creating template section:', error);
    return NextResponse.json(
      { error: 'Failed to create template section' },
      { status: 500 }
    );
  }
}

// セクションの順序を一括更新
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: templateId } = params;
    const { sections } = await request.json();

    // テンプレートが存在するか確認
    const template = await prisma.jobTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Job template not found' },
        { status: 404 }
      );
    }

    // バリデーション
    if (!Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json(
        { error: 'Sections array is required' },
        { status: 400 }
      );
    }

    // トランザクション内でセクションの順序を更新
    const updatedSections = await prisma.$transaction(
      sections.map((section, index) =>
        prisma.jobTemplateSection.update({
          where: { id: section.id },
          data: { order: index },
        })
      )
    );

    // レスポンスを返す
    return NextResponse.json({ sections: updatedSections }, { status: 200 });
  } catch (error) {
    console.error('Error updating section order:', error);
    return NextResponse.json(
      { error: 'Failed to update section order' },
      { status: 500 }
    );
  }
}
