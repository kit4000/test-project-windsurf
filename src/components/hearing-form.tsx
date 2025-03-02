"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

type HearingItem = {
  id: string;
  question: string;
  description?: string;
  type: string;
  options?: string;
  required: boolean;
  order: number;
};

type HearingFormProps = {
  industryId: string;
};

export function HearingForm({ industryId }: HearingFormProps) {
  const [hearingItems, setHearingItems] = useState<HearingItem[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // モックデータ（後でAPIから取得するように変更）
  const MOCK_HEARING_ITEMS: Record<string, HearingItem[]> = {
    "it-software": [
      {
        id: "job-title",
        question: "募集する職種名を教えてください",
        description: "具体的な職種名（例：フロントエンドエンジニア、バックエンドエンジニアなど）",
        type: "text",
        required: true,
        order: 1,
      },
      {
        id: "job-description",
        question: "職務内容を具体的に教えてください",
        description: "主な業務内容、担当するプロジェクト、使用する技術など",
        type: "textarea",
        required: true,
        order: 2,
      },
      {
        id: "required-skills",
        question: "必須スキル・経験を教えてください",
        description: "応募者に必ず持っていてほしいスキルや経験",
        type: "textarea",
        required: true,
        order: 3,
      },
      {
        id: "preferred-skills",
        question: "歓迎するスキル・経験を教えてください",
        description: "あれば望ましいスキルや経験",
        type: "textarea",
        required: false,
        order: 4,
      },
      {
        id: "employment-type",
        question: "雇用形態を選択してください",
        type: "select",
        options: JSON.stringify(["正社員", "契約社員", "業務委託", "パートタイム"]),
        required: true,
        order: 5,
      },
      {
        id: "salary-range",
        question: "給与範囲を教えてください",
        description: "例：年収400万円〜600万円、スキル・経験に応じて決定など",
        type: "text",
        required: true,
        order: 6,
      },
      {
        id: "work-location",
        question: "勤務地を教えてください",
        type: "text",
        required: true,
        order: 7,
      },
      {
        id: "remote-work",
        question: "リモートワークの可否と条件を教えてください",
        type: "select",
        options: JSON.stringify(["リモートワーク不可", "週1-2日リモート可", "週3日以上リモート可", "フルリモート可"]),
        required: true,
        order: 8,
      },
      {
        id: "benefits",
        question: "福利厚生・待遇について教えてください",
        type: "textarea",
        required: false,
        order: 9,
      },
      {
        id: "selection-process",
        question: "選考プロセスを教えてください",
        description: "面接回数、コーディングテスト有無など",
        type: "textarea",
        required: true,
        order: 10,
      },
    ],
    "sales": [
      {
        id: "job-title",
        question: "募集する職種名を教えてください",
        description: "具体的な職種名（例：法人営業、ルート営業、店舗販売員など）",
        type: "text",
        required: true,
        order: 1,
      },
      {
        id: "job-description",
        question: "職務内容を具体的に教えてください",
        description: "主な業務内容、担当する商材・サービス、営業方法など",
        type: "textarea",
        required: true,
        order: 2,
      },
      {
        id: "target-clients",
        question: "主な取引先・顧客層を教えてください",
        type: "textarea",
        required: true,
        order: 3,
      },
      {
        id: "required-skills",
        question: "必須スキル・経験を教えてください",
        description: "応募者に必ず持っていてほしいスキルや経験",
        type: "textarea",
        required: true,
        order: 4,
      },
      {
        id: "sales-target",
        question: "売上目標の有無とその水準について教えてください",
        type: "textarea",
        required: false,
        order: 5,
      },
      {
        id: "compensation",
        question: "報酬体系について教えてください",
        description: "固定給、インセンティブ、歩合制の有無など",
        type: "select",
        options: JSON.stringify(["完全固定給", "固定給+インセンティブ", "固定給+歩合制", "完全歩合制"]),
        required: true,
        order: 6,
      },
      {
        id: "work-location",
        question: "勤務地を教えてください",
        type: "text",
        required: true,
        order: 7,
      },
      {
        id: "work-style",
        question: "勤務形態について教えてください",
        description: "外回り営業の割合、直行直帰の可否など",
        type: "textarea",
        required: true,
        order: 8,
      },
      {
        id: "career-path",
        question: "キャリアパスについて教えてください",
        description: "将来のキャリア展望、昇進ステップなど",
        type: "textarea",
        required: false,
        order: 9,
      },
      {
        id: "selection-process",
        question: "選考プロセスを教えてください",
        description: "面接回数、ロールプレイング有無など",
        type: "textarea",
        required: true,
        order: 10,
      },
    ],
    "manufacturing": [
      {
        id: "job-title",
        question: "募集する職種名を教えてください",
        description: "具体的な職種名（例：生産管理、品質管理、機械設計など）",
        type: "text",
        required: true,
        order: 1,
      },
      {
        id: "job-description",
        question: "職務内容を具体的に教えてください",
        description: "主な業務内容、担当する工程、使用する機械・設備など",
        type: "textarea",
        required: true,
        order: 2,
      },
      {
        id: "products",
        question: "取り扱う製品・部品について教えてください",
        type: "textarea",
        required: true,
        order: 3,
      },
      {
        id: "required-skills",
        question: "必須スキル・経験を教えてください",
        description: "応募者に必ず持っていてほしいスキルや経験",
        type: "textarea",
        required: true,
        order: 4,
      },
      {
        id: "preferred-skills",
        question: "歓迎するスキル・経験を教えてください",
        description: "あれば望ましいスキルや経験、資格など",
        type: "textarea",
        required: false,
        order: 5,
      },
      {
        id: "work-environment",
        question: "作業環境について教えてください",
        description: "工場の環境、防塵・防音対策、温度管理など",
        type: "textarea",
        required: true,
        order: 6,
      },
      {
        id: "employment-type",
        question: "雇用形態を選択してください",
        type: "select",
        options: JSON.stringify(["正社員", "契約社員", "派遣社員", "パートタイム"]),
        required: true,
        order: 7,
      },
      {
        id: "work-hours",
        question: "勤務時間・シフトについて教えてください",
        description: "日勤・夜勤の有無、交代制の詳細など",
        type: "textarea",
        required: true,
        order: 8,
      },
      {
        id: "salary-range",
        question: "給与範囲を教えてください",
        description: "基本給、各種手当、昇給制度など",
        type: "text",
        required: true,
        order: 9,
      },
      {
        id: "work-location",
        question: "勤務地を教えてください",
        type: "text",
        required: true,
        order: 10,
      },
      {
        id: "selection-process",
        question: "選考プロセスを教えてください",
        description: "面接回数、実技テスト有無など",
        type: "textarea",
        required: true,
        order: 11,
      },
    ],
    "medical": [
      {
        id: "job-title",
        question: "募集する職種名を教えてください",
        description: "具体的な職種名（例：看護師、介護士、理学療法士など）",
        type: "text",
        required: true,
        order: 1,
      },
      {
        id: "job-description",
        question: "職務内容を具体的に教えてください",
        description: "主な業務内容、担当する患者層、チーム体制など",
        type: "textarea",
        required: true,
        order: 2,
      },
      {
        id: "facility-type",
        question: "施設の種類・規模について教えてください",
        description: "病院、クリニック、介護施設など。ベッド数や利用者数など",
        type: "textarea",
        required: true,
        order: 3,
      },
      {
        id: "required-qualifications",
        question: "必要な資格を教えてください",
        description: "応募に必須の資格、免許など",
        type: "textarea",
        required: true,
        order: 4,
      },
      {
        id: "required-experience",
        question: "必須の経験年数・スキルを教えてください",
        type: "textarea",
        required: true,
        order: 5,
      },
      {
        id: "work-hours",
        question: "勤務時間・シフトについて教えてください",
        description: "日勤・夜勤の有無、オンコール体制など",
        type: "textarea",
        required: true,
        order: 6,
      },
      {
        id: "employment-type",
        question: "雇用形態を選択してください",
        type: "select",
        options: JSON.stringify(["正社員", "契約社員", "パート", "アルバイト"]),
        required: true,
        order: 7,
      },
      {
        id: "salary-range",
        question: "給与範囲を教えてください",
        description: "基本給、各種手当（夜勤手当、資格手当など）",
        type: "text",
        required: true,
        order: 8,
      },
      {
        id: "work-location",
        question: "勤務地を教えてください",
        type: "text",
        required: true,
        order: 9,
      },
      {
        id: "benefits",
        question: "福利厚生・待遇について教えてください",
        description: "休暇制度、研修制度、住宅手当など",
        type: "textarea",
        required: false,
        order: 10,
      },
      {
        id: "selection-process",
        question: "選考プロセスを教えてください",
        description: "面接回数、実技・筆記試験有無など",
        type: "textarea",
        required: true,
        order: 11,
      },
    ],
    "service": [
      {
        id: "job-title",
        question: "募集する職種名を教えてください",
        description: "具体的な職種名（例：ホテルスタッフ、飲食店スタッフ、接客担当など）",
        type: "text",
        required: true,
        order: 1,
      },
      {
        id: "job-description",
        question: "職務内容を具体的に教えてください",
        description: "主な業務内容、担当する業務範囲、顧客対応など",
        type: "textarea",
        required: true,
        order: 2,
      },
      {
        id: "service-type",
        question: "提供するサービスについて教えてください",
        description: "飲食、宿泊、小売りなど具体的なサービス内容",
        type: "textarea",
        required: true,
        order: 3,
      },
      {
        id: "required-skills",
        question: "必須スキル・経験を教えてください",
        description: "応募者に必ず持っていてほしいスキルや経験",
        type: "textarea",
        required: true,
        order: 4,
      },
      {
        id: "preferred-skills",
        question: "歓迎するスキル・経験を教えてください",
        description: "あれば望ましいスキルや経験、資格など",
        type: "textarea",
        required: false,
        order: 5,
      },
      {
        id: "work-hours",
        question: "勤務時間・シフトについて教えてください",
        description: "シフト制、土日祝日出勤の有無など",
        type: "textarea",
        required: true,
        order: 6,
      },
      {
        id: "employment-type",
        question: "雇用形態を選択してください",
        type: "select",
        options: JSON.stringify(["正社員", "契約社員", "パート", "アルバイト"]),
        required: true,
        order: 7,
      },
      {
        id: "salary-range",
        question: "給与範囲を教えてください",
        description: "時給、月給、インセンティブなど",
        type: "text",
        required: true,
        order: 8,
      },
      {
        id: "work-location",
        question: "勤務地を教えてください",
        type: "text",
        required: true,
        order: 9,
      },
      {
        id: "benefits",
        question: "福利厚生・待遇について教えてください",
        description: "社員割引、食事補助、制服貸与など",
        type: "textarea",
        required: false,
        order: 10,
      },
      {
        id: "selection-process",
        question: "選考プロセスを教えてください",
        description: "面接回数、実技試験有無など",
        type: "textarea",
        required: true,
        order: 11,
      },
    ],
  };

  useEffect(() => {
    // モックデータを使用
    if (MOCK_HEARING_ITEMS[industryId]) {
      setHearingItems(MOCK_HEARING_ITEMS[industryId]);
      // 初期フォームデータを設定
      const initialData: Record<string, string> = {};
      MOCK_HEARING_ITEMS[industryId].forEach((item) => {
        initialData[item.id] = "";
      });
      setFormData(initialData);
      setLoading(false);
    } else {
      setError("選択された業種のヒアリング項目が見つかりません");
      setLoading(false);
    }

    // 実際のAPI実装時は以下のようにAPIから取得
    /*
    const fetchHearingItems = async () => {
      try {
        const response = await fetch(`/api/hearing-items/${industryId}`);
        if (!response.ok) throw new Error("Failed to fetch hearing items");
        
        const data = await response.json();
        setHearingItems(data.hearingItems);
        
        // 初期フォームデータを設定
        const initialData: Record<string, string> = {};
        data.hearingItems.forEach((item: HearingItem) => {
          initialData[item.id] = "";
        });
        setFormData(initialData);
        
        setLoading(false);
      } catch (err) {
        setError("ヒアリング項目の取得に失敗しました");
        setLoading(false);
      }
    };
    
    fetchHearingItems();
    */
  }, [industryId]);

  const handleInputChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 必須項目のバリデーション
    const requiredItems = hearingItems.filter((item) => item.required);
    const missingItems = requiredItems.filter((item) => !formData[item.id]);
    
    if (missingItems.length > 0) {
      alert("必須項目が入力されていません。");
      return;
    }
    
    // セッション作成APIを呼び出し（実装時）
    /*
    try {
      const response = await fetch("/api/hearing-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          industryId,
          responses: Object.entries(formData).map(([itemId, answer]) => ({
            hearingItemId: itemId,
            answer,
          })),
        }),
      });
      
      if (!response.ok) throw new Error("Failed to create session");
      
      const data = await response.json();
      router.push(`/result/${data.session.id}`);
    } catch (err) {
      alert("セッションの作成に失敗しました。");
    }
    */
    
    // 今はモックとして結果ページに遷移（実装時は上記のAPIコメントを外す）
    router.push(`/result/mock-session-id?industry=${industryId}`);
  };

  if (loading) return <div>ヒアリング項目を読み込み中...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {hearingItems.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-2">
              <Label htmlFor={item.id} className="text-base font-medium">
                {item.question}
                {item.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {item.description && (
                <p className="text-sm text-muted-foreground">{item.description}</p>
              )}
              
              {item.type === "text" && (
                <Input
                  id={item.id}
                  value={formData[item.id] || ""}
                  onChange={(e) => handleInputChange(item.id, e.target.value)}
                  className="mt-2"
                  required={item.required}
                />
              )}
              
              {item.type === "textarea" && (
                <Textarea
                  id={item.id}
                  value={formData[item.id] || ""}
                  onChange={(e) => handleInputChange(item.id, e.target.value)}
                  className="mt-2"
                  rows={4}
                  required={item.required}
                />
              )}
              
              {item.type === "select" && item.options && (
                <Select
                  value={formData[item.id] || ""}
                  onValueChange={(value) => handleInputChange(item.id, value)}
                  required={item.required}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {JSON.parse(item.options).map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          戻る
        </Button>
        <Button type="submit">回答を送信</Button>
      </div>
    </form>
  );
}
