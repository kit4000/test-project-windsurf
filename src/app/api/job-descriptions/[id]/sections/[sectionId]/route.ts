import { NextRequest, NextResponse } from 'next/server';
import { JobDescriptionService } from '@/lib/utils/job-description-service';
import { UpdateJobDescriptionSectionRequest } from '@/types/job-description';
import { prisma } from '@/lib/prisma/client';

interface RouteParams {
  params: {
    id: string;
    sectionId: string;
  };
}

// 特定のセクションを取得
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, sectionId } = params;

    // セクションを取得
    const section = await prisma.jobDescriptionSection.findUnique({
      where: { id: sectionId },
      include: {
        templateSection: true,
      },
    });

    if (!section) {
      return NextResponse.json(
        { error: 'Job description section not found' },
        { status: 404 }
      );
    }

    // セクションが指定された募集要項に属しているか確認
    if (section.jobDescriptionId !== id) {
      return NextResponse.json(
        { error: 'Section does not belong to the specified job description' },
        { status: 400 }
      );
    }

    // レスポンスを返す
    return NextResponse.json({ section }, { status: 200 });
  } catch (error) {
    console.error('Error fetching job description section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job description section' },
      { status: 500 }
    );
  }
}

// セクションを更新
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, sectionId } = params;
    const body: UpdateJobDescriptionSectionRequest = await request.json();

    // セクションが存在するか確認
    const section = await prisma.jobDescriptionSection.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      return NextResponse.json(
        { error: 'Job description section not found' },
        { status: 404 }
      );
    }

    // セクションが指定された募集要項に属しているか確認
    if (section.jobDescriptionId !== id) {
      return NextResponse.json(
        { error: 'Section does not belong to the specified job description' },
        { status: 400 }
      );
    }

    // コンテンツのバリデーション
    if (!body.content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // セクションを更新
    const updatedSection = await JobDescriptionService.updateSection(
      sectionId,
      body.content
    );

    // レスポンスを返す
    return NextResponse.json({ section: updatedSection }, { status: 200 });
  } catch (error) {
    console.error('Error updating job description section:', error);
    return NextResponse.json(
      { error: 'Failed to update job description section' },
      { status: 500 }
    );
  }
}

// セクションの個別再生成
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, sectionId } = params;
    const { aiProviderId } = await request.json();

    // セクションが存在するか確認
    const section = await prisma.jobDescriptionSection.findUnique({
      where: { id: sectionId },
      include: {
        templateSection: true,
        jobDescription: {
          include: {
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
        },
      },
    });

    if (!section) {
      return NextResponse.json(
        { error: 'Job description section not found' },
        { status: 404 }
      );
    }

    // セクションが指定された募集要項に属しているか確認
    if (section.jobDescriptionId !== id) {
      return NextResponse.json(
        { error: 'Section does not belong to the specified job description' },
        { status: 400 }
      );
    }

    // AIサービスを初期化
    const aiService = await AIServiceFactory.createService(aiProviderId);

    // ヒアリング内容を整形
    const hearingData = section.jobDescription.hearingSession?.responses.map(response => {
      return {
        question: response.hearingItem.question,
        answer: response.answer,
      };
    }) || [];

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
    const updatedSection = await JobDescriptionService.updateSection(
      sectionId,
      content
    );

    // レスポンスを返す
    return NextResponse.json({ section: updatedSection }, { status: 200 });
  } catch (error) {
    console.error('Error regenerating job description section:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate job description section' },
      { status: 500 }
    );
  }
}
