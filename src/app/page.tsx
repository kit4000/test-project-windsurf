"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IndustrySelector } from "@/components/industry-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const router = useRouter();

  const handleIndustrySelect = (industryId: string) => {
    setSelectedIndustry(industryId);
  };

  const handleStartHearing = () => {
    if (selectedIndustry) {
      router.push(`/hearing/${selectedIndustry}`);
    }
  };

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
          <IndustrySelector 
            onSelect={handleIndustrySelect} 
            selectedIndustry={selectedIndustry} 
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleStartHearing} 
            disabled={!selectedIndustry}
          >
            ヒアリングを開始
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
