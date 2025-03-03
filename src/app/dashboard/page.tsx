import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="募集要項"
          description="ヒアリング内容から募集要項を自動生成します"
          href="/dashboard/job-descriptions"
        />
        <Card
          title="テンプレート"
          description="職種別の募集要項テンプレートを管理します"
          href="/dashboard/templates"
        />
        <Card
          title="AI設定"
          description="生成AIのプロバイダーやAPIキーを設定します"
          href="/dashboard/ai-settings"
        />
      </div>

      <div className="bg-muted/40 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">募集要項自動生成システムについて</h2>
        <p className="mb-4">
          このシステムは、ヒアリング内容に基づいて生成AIを活用し、最適な募集要項を自動的に作成します。
          職種ごとに異なるテンプレートを用意でき、各項目を個別に編集することも可能です。
        </p>
        <div className="space-y-2">
          <h3 className="font-medium">主な機能</h3>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>ヒアリング内容からの募集要項自動生成</li>
            <li>職種別テンプレートの管理</li>
            <li>複数のAIプロバイダーに対応（OpenAI、Anthropic、Gemini）</li>
            <li>募集要項の項目ごとの編集や再生成</li>
            <li>作成した募集要項の出力・管理</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      <div className="p-6 flex flex-col h-full">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground mt-2 flex-1">{description}</p>
        <div className="mt-4">
          <Button asChild>
            <Link href={href}>
              管理する
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
