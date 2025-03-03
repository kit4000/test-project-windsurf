import { NextRequest, NextResponse } from 'next/server';
import { AIProviderService } from '@/lib/utils/ai-provider-service';
import { 
  CreateAIProviderRequest,
  UpdateAIProviderRequest
} from '@/types/job-description';

// API root handler
export async function GET(request: NextRequest) {
  try {
    // クエリパラメータの取得
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const provider = searchParams.get('provider');

    let providers;
    if (name) {
      // 名前で検索
      providers = await AIProviderService.searchProvidersByName(name);
    } else if (provider) {
      // プロバイダータイプで検索
      providers = await AIProviderService.getProvidersByType(provider);
    } else {
      // 全てのプロバイダーを取得
      providers = await AIProviderService.getAllProviders();
    }

    // レスポンスを返す
    return NextResponse.json({ providers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching AI providers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI providers' },
      { status: 500 }
    );
  }
}

// 新しいAIプロバイダーを作成
export async function POST(request: NextRequest) {
  try {
    const body: CreateAIProviderRequest = await request.json();

    // 必須項目のバリデーション
    if (!body.name || !body.provider || !body.modelName || !body.apiKey) {
      return NextResponse.json(
        { error: 'Name, provider, model name and API key are required' },
        { status: 400 }
      );
    }

    // APIキーの検証（オプション）
    // const isValid = await AIProviderService.validateApiKey(
    //   body.provider,
    //   body.apiKey,
    //   body.baseUrl
    // );
    // if (!isValid) {
    //   return NextResponse.json(
    //     { error: 'Invalid API key' },
    //     { status: 400 }
    //   );
    // }

    // AIプロバイダーを作成
    const provider = await AIProviderService.createProvider({
      name: body.name,
      provider: body.provider,
      modelName: body.modelName,
      apiKey: body.apiKey,
      baseUrl: body.baseUrl,
      isDefault: body.isDefault,
      temperature: body.temperature,
      maxTokens: body.maxTokens,
    });

    // レスポンスを返す
    return NextResponse.json({ provider }, { status: 201 });
  } catch (error) {
    console.error('Error creating AI provider:', error);
    return NextResponse.json(
      { error: 'Failed to create AI provider' },
      { status: 500 }
    );
  }
}
