import { NextRequest, NextResponse } from 'next/server';
import { JobDescriptionService } from '@/lib/utils/job-description-service';
import { RegenerateJobDescriptionRequest, UpdateJobDescriptionStatusRequest } from '@/types/job-description';
import { prisma } from '@/lib/prisma/client';

interface RouteParams {
  params: {
    id: string;
  };
}

// 特定の募集要項を取得
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // 募集要項を取得
    const jobDescription = await prisma.jobDescription.findUnique({
      where: { id },
      include: {
        jobTemplate: true,
        hearingSession: {
          include: {
            industry: true,
            responses: {
              include: {
                hearingItem: true,
              },
            },
          },
        },
        sections: {
          include: {
            templateSection: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description not found' },
        { status: 404 }
      );
    }

    // レスポンスを返す
    return NextResponse.json({ jobDescription }, { status: 200 });
  } catch (error) {
    console.error('Error fetching job description:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job description' },
      { status: 500 }
    );
  }
}

// 募集要項を再生成
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body: RegenerateJobDescriptionRequest = await request.json();

    // 募集要項が存在するか確認
    const existingDescription = await prisma.jobDescription.findUnique({
      where: { id },
    });

    if (!existingDescription) {
      return NextResponse.json(
        { error: 'Job description not found' },
        { status: 404 }
      );
    }

    // 募集要項を再生成
    const regeneratedDescription = await JobDescriptionService.regenerateDescription(
      id,
      body.aiProviderId
    );

    // レスポンスを返す
    return NextResponse.json({ jobDescription: regeneratedDescription }, { status: 200 });
  } catch (error) {
    console.error('Error regenerating job description:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate job description' },
      { status: 500 }
    );
  }
}

// 募集要項の公開ステータスを更新
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body: UpdateJobDescriptionStatusRequest = await request.json();

    // 募集要項が存在するか確認
    const existingDescription = await prisma.jobDescription.findUnique({
      where: { id },
    });

    if (!existingDescription) {
      return NextResponse.json(
        { error: 'Job description not found' },
        { status: 404 }
      );
    }

    // ステータスのバリデーション
    if (!body.status || !['draft', 'published'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Status must be either "draft" or "published"' },
        { status: 400 }
      );
    }

    // ステータスを更新
    const updatedDescription = await JobDescriptionService.updateStatus(
      id,
      body.status as 'draft' | 'published'
    );

    // レスポンスを返す
    return NextResponse.json({ jobDescription: updatedDescription }, { status: 200 });
  } catch (error) {
    console.error('Error updating job description status:', error);
    return NextResponse.json(
      { error: 'Failed to update job description status' },
      { status: 500 }
    );
  }
}

// 募集要項を削除
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // 募集要項が存在するか確認
    const existingDescription = await prisma.jobDescription.findUnique({
      where: { id },
    });

    if (!existingDescription) {
      return NextResponse.json(
        { error: 'Job description not found' },
        { status: 404 }
      );
    }

    // 募集要項を削除
    await prisma.jobDescription.delete({
      where: { id },
    });

    // 204 No Content でレスポンスを返す
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting job description:', error);
    return NextResponse.json(
      { error: 'Failed to delete job description' },
      { status: 500 }
    );
  }
}
