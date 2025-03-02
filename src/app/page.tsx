import { IndustrySelector } from "@/components/industry-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>採用要項ヒアリングシステム</CardTitle>
          <CardDescription>
            業種を選択して、採用要項作成のためのヒアリングを始めましょう。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IndustrySelector />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button disabled>ヒアリングを開始</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
