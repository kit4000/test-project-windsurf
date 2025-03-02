import { HearingForm } from "@/components/hearing-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HearingPage({
  params,
}: {
  params: { industryId: string };
}) {
  return (
    <main className="min-h-screen p-4">
      <Card>
        <CardHeader>
          <CardTitle>採用要項ヒアリング</CardTitle>
          <CardDescription>
            以下の質問に回答して、採用要項作成に必要な情報を収集します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HearingForm industryId={params.industryId} />
        </CardContent>
      </Card>
    </main>
  );
}
