"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Industry = {
  id: string;
  name: string;
  description: string;
};

// モックデータ（後でAPIから取得するように変更）
const MOCK_INDUSTRIES: Industry[] = [
  {
    id: "it-software",
    name: "IT・ソフトウェア開発",
    description: "プログラマー、エンジニア、ITマネージャーなどの職種",
  },
  {
    id: "sales",
    name: "営業・販売",
    description: "法人営業、個人営業、店舗販売員などの職種",
  },
  {
    id: "service",
    name: "サービス業",
    description: "接客、フード、宿泊などのサービス関連職種",
  },
  {
    id: "manufacturing",
    name: "製造業",
    description: "生産管理、品質管理、設計などの製造関連職種",
  },
  {
    id: "medical",
    name: "医療・福祉",
    description: "医師、看護師、介護士などの医療福祉関連職種",
  },
];

type IndustrySelectorProps = {
  onSelect: (industryId: string) => void;
  selectedIndustry: string;
};

export function IndustrySelector({ onSelect, selectedIndustry }: IndustrySelectorProps) {
  const handleIndustryChange = (value: string) => {
    onSelect(value);
  };

  return (
    <div className="space-y-4">
      <Label className="text-base">業種を選択してください</Label>
      <RadioGroup
        value={selectedIndustry}
        onValueChange={handleIndustryChange}
        className="grid gap-4 grid-cols-1 md:grid-cols-2"
      >
        {MOCK_INDUSTRIES.map((industry) => (
          <div key={industry.id} className="relative">
            <RadioGroupItem
              value={industry.id}
              id={industry.id}
              className="peer sr-only"
            />
            <Label
              htmlFor={industry.id}
              className="flex flex-col items-start p-4 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-accent"
            >
              <span className="font-medium">{industry.name}</span>
              <span className="text-sm text-muted-foreground">
                {industry.description}
              </span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
