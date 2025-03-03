import { NextRequest, NextResponse } from 'next/server';
import { JobDescriptionService } from '@/lib/utils/job-description-service';
import { CreateJobDescriptionRequest } from '@/types/job-description';
import { prisma } from '@/lib/prisma/client';

// 募集要項の一覧を取得
export async function GET(request: NextRequest) {
  try {
    // クエリパラメータの取得
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // 検索条件の構築
    const where: any = {};
    if (sessionId) {
      where.sessionId = sessionId;
    }
    if (status) {
      where.status = status;
    }

    // 募集要項の総数を取得
    const total = await prisma.jobDescription.count({ where });

    // 募集要項の一覧を取得
    const jobDescriptions = await prisma.jobDescription.findMany({
      where,
      include: {
        jobTemplate: true,
        hearingSession: {
          include: {
            industry: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip,
      take: limit,
    });

    // ページネーション情報
    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    // レスポンスを返す
    return NextResponse.json({ jobDescriptions, pagination }, { status: 200 });
  } catch (error) {
    console.error('Error fetching job descriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job descriptions' },
      { status: 500 }
    );
  }
}

// 新しい募集要項を生成
export async function POST(request: NextRequest) {
  try {
    const body: CreateJobDescriptionRequest = await request.json();

    // 必須項目のバリデーション
    if (!body.title || !body.sessionId || !body.jobTemplateId) {
      return NextResponse.json(
        { error: 'Title, session ID, and job template ID are required' },
        { status: 400 }
      );
    }

    // セッションが存在するか確認
    const session = await prisma.hearingSession.findUnique({
      where: { id: body.sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Hearing session not found' },
        { status: 404 }
      );
    }

    // テンプレートが存在するか確認
    const template = await prisma.jobTemplate.findUnique({
      where: { id: body.jobTemplateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Job template not found' },
        { status: 404 }
      );
    }

    // 募集要項を生成
    const jobDescription = await JobDescriptionService.generateFromSession(
      body.sessionId,
      body.jobTemplateId,
      body.title,
      body.aiProviderId
    );

    // レスポンスを返す
    return NextResponse.json({ jobDescription }, { status: 201 });
  } catch (error) {
    console.error('Error creating job description:', error);
    return NextResponse.json(
      { error: 'Failed to create job description' },
      { status: 500 }
    );
  }
}
