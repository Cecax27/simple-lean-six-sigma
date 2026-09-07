"use client";

import { Info } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ishikawaTooltips } from "@/tools/ishikawa/ishikawa-tooltips";

interface EffectFieldProps {
  value: string;
  onChange: (effect: string) => void;
}

export function EffectField({ value, onChange }: EffectFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <label className="block text-sm font-medium text-muted-foreground">
          {ishikawaTooltips.effect.label}
        </label>
        <Tooltip>
          <TooltipTrigger>
            <span className="inline-flex cursor-default">
              <Info className="size-3.5 text-muted-foreground/60" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-80 text-xs">{ishikawaTooltips.effect.tip}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ej. Quejas de clientes por diametro de valvulas"
        className="text-sm"
      />
    </div>
  );
}
