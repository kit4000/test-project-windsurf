import { NextRequest, NextResponse } from 'next/server';
import { TemplateService } from '@/lib/utils/template-service';
import { UpdateJobTemplateRequest } from '@/types/job-description';

interface RouteParams {
  params: {
    id: string;
  };
}

// 特定のテンプレートを取得
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // テンプレートを取得
    const template = await prisma.jobTemplate.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Job template not found' },
        { status: 404 }
      );
    }

    // レスポンスを返す
    return NextResponse.json({ template }, { status: 200 });
  } catch (error) {
    console.error('Error fetching job template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job template' },
      { status: 500 }
    );
  }
}

// テンプレートを更新
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body: UpdateJobTemplateRequest = await request.json();

    // テンプレートが存在するか確認
    const existingTemplate = await prisma.jobTemplate.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Job template not found' },
        { status: 404 }
      );
    }

    // テンプレートを更新
    const updatedTemplate = await TemplateService.updateJobTemplate(id, body);

    // レスポンスを返す
    return NextResponse.json({ template: updatedTemplate }, { status: 200 });
  } catch (error) {
    console.error('Error updating job template:', error);
    return NextResponse.json(
      { error: 'Failed to update job template' },
      { status: 500 }
    );
  }
}

// テンプレートを削除
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // テンプレートが存在するか確認
    const existingTemplate = await prisma.jobTemplate.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Job template not found' },
        { status: 404 }
      );
    }

    // テンプレートを削除
    await TemplateService.deleteJobTemplate(id);

    // 204 No Content でレスポンスを返す
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting job template:', error);
    return NextResponse.json(
      { error: 'Failed to delete job template' },
      { status: 500 }
    );
  }
}

// テンプレートを複製
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const { newName } = await request.json();

    if (!newName) {
      return NextResponse.json(
        { error: 'New name is required' },
        { status: 400 }
      );
    }

    // テンプレートが存在するか確認
    const existingTemplate = await prisma.jobTemplate.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Job template not found' },
        { status: 404 }
      );
    }

    // テンプレートを複製
    const clonedTemplate = await TemplateService.cloneJobTemplate(id, newName);

    // レスポンスを返す
    return NextResponse.json({ template: clonedTemplate }, { status: 201 });
  } catch (error) {
    console.error('Error cloning job template:', error);
    return NextResponse.json(
      { error: 'Failed to clone job template' },
      { status: 500 }
    );
  }
}
