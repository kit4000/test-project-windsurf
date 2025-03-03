import { NextRequest, NextResponse } from 'next/server';
import { TemplateService } from '@/lib/utils/template-service';
import { UpdateTemplateSectionRequest } from '@/types/job-description';
import { prisma } from '@/lib/prisma/client';

interface RouteParams {
  params: {
    id: string;
  };
}

// 特定のセクションを取得
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // セクションを取得
    const section = await prisma.jobTemplateSection.findUnique({
      where: { id },
    });

    if (!section) {
      return NextResponse.json(
        { error: 'Template section not found' },
        { status: 404 }
      );
    }

    // レスポンスを返す
    return NextResponse.json({ section }, { status: 200 });
  } catch (error) {
    console.error('Error fetching template section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template section' },
      { status: 500 }
    );
  }
}

// セクションを更新
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body: UpdateTemplateSectionRequest = await request.json();

    // セクションが存在するか確認
    const existingSection = await prisma.jobTemplateSection.findUnique({
      where: { id },
    });

    if (!existingSection) {
      return NextResponse.json(
        { error: 'Template section not found' },
        { status: 404 }
      );
    }

    // セクションを更新
    const updatedSection = await TemplateService.updateTemplateSection(id, body);

    // レスポンスを返す
    return NextResponse.json({ section: updatedSection }, { status: 200 });
  } catch (error) {
    console.error('Error updating template section:', error);
    return NextResponse.json(
      { error: 'Failed to update template section' },
      { status: 500 }
    );
  }
}

// セクションを削除
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // セクションが存在するか確認
    const existingSection = await prisma.jobTemplateSection.findUnique({
      where: { id },
    });

    if (!existingSection) {
      return NextResponse.json(
        { error: 'Template section not found' },
        { status: 404 }
      );
    }

    // そのテンプレートの残りのセクション数を確認
    const remainingSectionsCount = await prisma.jobTemplateSection.count({
      where: {
        jobTemplateId: existingSection.jobTemplateId,
        id: { not: id },
      },
    });

    // テンプレートは少なくとも1つのセクションを持つ必要がある
    if (remainingSectionsCount === 0) {
      return NextResponse.json(
        { error: 'Cannot delete the only section of a template' },
        { status: 400 }
      );
    }

    // セクションを削除
    await TemplateService.deleteTemplateSection(id);

    // 204 No Content でレスポンスを返す
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting template section:', error);
    return NextResponse.json(
      { error: 'Failed to delete template section' },
      { status: 500 }
    );
  }
}
