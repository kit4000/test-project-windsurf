"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { HearingForm } from "./hearing-form";

type PromptGeneratorProps = {
  sessionId: string;
  industryId?: string;
};

// モック回答データ
const MOCK_RESPONSES: Record<string, Record<string, Record<string, string>>> = {
  "it-software": {
    "mock-session-id": {
      "job-title": "フロントエンドエンジニア",
      "job-description": "Webアプリケーションの開発に携わり、特にユーザーインターフェースの設計と実装を担当していただきます。React、TypeScriptを使用した開発経験が必要です。アジャイル開発チームの一員として、デザイナーやバックエンドエンジニアと協力して製品開発を進めます。",
      "required-skills": "- HTML/CSS/JavaScriptの十分な理解\n- React.jsによる開発経験2年以上\n- TypeScriptの実務経験\n- Gitによるバージョン管理の経験\n- レスポンシブデザインの実装経験",
      "preferred-skills": "- Next.jsフレームワークの使用経験\n- UIライブラリ（Material-UI, Tailwindなど）の使用経験\n- テスト駆動開発の経験\n- CI/CDパイプラインの構築経験\n- Webアクセシビリティへの理解",
      "employment-type": "正社員",
      "salary-range": "年収500万円〜700万円（スキル・経験による）",
      "work-location": "東京都渋谷区",
      "remote-work": "週3日以上リモート可",
      "benefits": "- 各種社会保険完備\n- 交通費支給（上限あり）\n- 技術書籍購入支援\n- 勉強会・カンファレンス参加費補助\n- フレックスタイム制\n- リモートワーク手当",
      "selection-process": "1. 書類選考\n2. 技術面接（1回）\n3. コーディングテスト\n4. 最終面接\n内定",
    },
  },
  "sales": {
    "mock-session-id": {
      "job-title": "法人営業",
      "job-description": "IT関連サービスの法人営業として、新規顧客の開拓から契約締結までを担当していただきます。クラウドサービスやSaaSプロダクトの提案を行い、顧客の課題解決に貢献します。目標達成のために、計画的なアプローチと粘り強い交渉力が求められます。",
      "target-clients": "中小企業から大企業まで幅広い業種のIT部門責任者、経営層",
      "required-skills": "- 法人営業経験3年以上\n- ITサービスやソフトウェア関連の営業経験\n- 顧客折衝・提案書作成スキル\n- 基本的なITリテラシー",
      "sales-target": "四半期ごとの売上目標あり（詳細は入社後に説明）",
      "compensation": "固定給+インセンティブ",
      "work-location": "大阪市北区（本社）",
      "work-style": "週3-4日程度の外回り営業あり。直行直帰可。社用車またはカーシェアサービスの利用可能。",
      "career-path": "営業 → チームリーダー → マネージャー → 営業部長というキャリアパスあり。実績に応じたスピード昇進も可能。",
      "selection-process": "1. 書類選考\n2. 一次面接（営業マネージャー）\n3. 二次面接（営業ロールプレイング含む）\n4. 最終面接（役員）\n内定",
    },
  },
};

export function PromptGenerator({ sessionId, industryId }: PromptGeneratorProps) {
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (industryId && MOCK_RESPONSES[industryId]?.[sessionId]) {
      // モックデータからプロンプトを生成
      const responses = MOCK_RESPONSES[industryId][sessionId];
      generatePrompt(industryId, responses);
      setLoading(false);
    } else {
      // 実際のAPI実装時は以下のようにAPIから取得
      /*
      const fetchSessionData = async () => {
        try {
          const response = await fetch(`/api/hearing-sessions/${sessionId}`);
          if (!response.ok) throw new Error("Failed to fetch session data");
          
          const data = await response.json();
          generatePrompt(data.session.industryId, data.responses);
          
          setLoading(false);
        } catch (err) {
          setError("セッションデータの取得に失敗しました");
          setLoading(false);
        }
      };
      
      fetchSessionData();
      */
      setError("セッションデータが見つかりません。");
      setLoading(false);
    }
  }, [sessionId, industryId]);

  const generatePrompt = (industry: string, responses: Record<string, string>) => {
    let generatedPrompt = "";

    // 業種ごとにプロンプトテンプレートを変更
    if (industry === "it-software") {
      generatedPrompt = `以下の情報を基に、魅力的なIT企業の採用要項を作成してください。応募者の目を引き、応募したくなるような文章にしてください。

【募集職種】
${responses["job-title"]}

【職務内容】
${responses["job-description"]}

【必須スキル・経験】
${responses["required-skills"]}

【歓迎スキル・経験】
${responses["preferred-skills"] || "特になし"}

【雇用形態】
${responses["employment-type"]}

【給与】
${responses["salary-range"]}

【勤務地】
${responses["work-location"]}

【リモートワーク】
${responses["remote-work"]}

【福利厚生・待遇】
${responses["benefits"] || "各種社会保険完備"}

【選考プロセス】
${responses["selection-process"]}

以上の情報を整理し、以下の要素を含む採用要項を作成してください：
1. 会社のミッションや価値観に基づいた魅力的な導入文
2. 具体的な業務内容と期待される成果
3. 成長機会やキャリアパスの説明
4. 応募方法と選考フロー

フォーマットは見やすく、読みやすい構成にしてください。また、技術的な専門用語は必要に応じて簡潔な説明を加えてください。`;
    } else if (industry === "sales") {
      generatedPrompt = `以下の情報を基に、営業職の魅力的な採用要項を作成してください。やる気のある営業人材を惹きつける内容を心がけてください。

【募集職種】
${responses["job-title"]}

【職務内容】
${responses["job-description"]}

【主な取引先・顧客層】
${responses["target-clients"]}

【必須スキル・経験】
${responses["required-skills"]}

【売上目標】
${responses["sales-target"] || "詳細は面接時にご説明します"}

【報酬体系】
${responses["compensation"]}

【勤務地】
${responses["work-location"]}

【勤務形態】
${responses["work-style"]}

【キャリアパス】
${responses["career-path"] || "実績に応じたキャリアアップの機会があります"}

【選考プロセス】
${responses["selection-process"]}

以上の情報を整理し、以下の要素を含む採用要項を作成してください：
1. 営業職としての魅力やインセンティブを強調した導入文
2. 具体的な業務内容と成功事例
3. 営業として成長できる環境や支援体制
4. 報酬体系と収入例
5. 応募方法と選考フロー

フォーマットは見やすく、読みやすい構成にしてください。また、やる気のある営業人材が「この会社で働きたい」と思えるような熱意のある文章を心がけてください。`;
    } else {
      // 他の業種のテンプレート
      generatedPrompt = `以下の情報を基に、採用要項を作成してください。

${Object.entries(responses)
        .map(([key, value]) => `【${key}】\n${value}`)
        .join("\n\n")}

以上の情報を整理し、魅力的な採用要項を作成してください。応募者の目を引く内容を心がけてください。`;
    }

    setPrompt(generatedPrompt);
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div>プロンプトを生成中...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <Textarea
            value={prompt}
            readOnly
            className="min-h-[300px] font-mono text-sm"
          />
          <div className="mt-4 flex justify-end">
            <Button onClick={handleCopyClick}>
              {copied ? "コピーしました！" : "プロンプトをコピー"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => window.history.back()}>
          戻る
        </Button>
        <Button onClick={() => window.location.href = "/"}>
          トップページへ
        </Button>
      </div>
    </div>
  );
}
