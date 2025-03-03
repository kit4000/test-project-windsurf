import { NextRequest, NextResponse } from 'next/server';
import { AIProviderService } from '@/lib/utils/ai-provider-service';
import { UpdateAIProviderRequest } from '@/types/job-description';

interface RouteParams {
  params: {
    id: string;
  };
}

// 特定のAIプロバイダーを取得
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const provider = await AIProviderService.getProviderById(id);

    if (!provider) {
      return NextResponse.json(
        { error: 'AI provider not found' },
        { status: 404 }
      );
    }

    // レスポンスを返す
    return NextResponse.json({ provider }, { status: 200 });
  } catch (error) {
    console.error('Error fetching AI provider:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI provider' },
      { status: 500 }
    );
  }
}

// AIプロバイダーを更新
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body: UpdateAIProviderRequest = await request.json();

    // プロバイダーが存在するか確認
    const existingProvider = await AIProviderService.getProviderById(id);
    if (!existingProvider) {
      return NextResponse.json(
        { error: 'AI provider not found' },
        { status: 404 }
      );
    }

    // APIキーの検証（オプション、実際の検証は本番環境では実装すべき）
    // if (body.apiKey && body.apiKey !== '********') {
    //   const isValid = await AIProviderService.validateApiKey(
    //     body.provider || existingProvider.provider,
    //     body.apiKey,
    //     body.baseUrl || existingProvider.baseUrl
    //   );
    //   if (!isValid) {
    //     return NextResponse.json(
    //       { error: 'Invalid API key' },
    //       { status: 400 }
    //     );
    //   }
    // }

    // AIプロバイダーを更新
    const updatedProvider = await AIProviderService.updateProvider(id, body);

    // レスポンスを返す
    return NextResponse.json({ provider: updatedProvider }, { status: 200 });
  } catch (error) {
    console.error('Error updating AI provider:', error);
    return NextResponse.json(
      { error: 'Failed to update AI provider' },
      { status: 500 }
    );
  }
}

// AIプロバイダーを削除
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // プロバイダーが存在するか確認
    const existingProvider = await AIProviderService.getProviderById(id);
    if (!existingProvider) {
      return NextResponse.json(
        { error: 'AI provider not found' },
        { status: 404 }
      );
    }

    // AIプロバイダーを削除
    await AIProviderService.deleteProvider(id);

    // 204 No Content でレスポンスを返す
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting AI provider:', error);
    return NextResponse.json(
      { error: 'Failed to delete AI provider' },
      { status: 500 }
    );
  }
}
