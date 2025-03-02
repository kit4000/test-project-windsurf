import { PromptGenerator } from "@/components/prompt-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResultPage({
  params,
  searchParams,
}: {
  params: { sessionId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const industryId = searchParams.industry as string;

  return (
    <main className="min-h-screen p-4">
      <Card>
        <CardHeader>
          <CardTitle>採用要項作成プロンプト</CardTitle>
          <CardDescription>
            ヒアリング内容から生成された採用要項作成のためのプロンプトです。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PromptGenerator sessionId={params.sessionId} industryId={industryId} />
        </CardContent>
      </Card>
    </main>
  );
}
