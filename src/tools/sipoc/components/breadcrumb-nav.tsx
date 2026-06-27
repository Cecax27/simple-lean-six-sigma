import type { SIPOCDiagram } from "@/tools/sipoc/types";

import { Button } from "@/components/ui/button";

interface BreadcrumbNavProps {
  root: SIPOCDiagram;
  path: string[];
  onNavigate: (level: number) => void;
}

export function BreadcrumbNav({ root, path, onNavigate }: BreadcrumbNavProps) {
  const labels = [root.title];

  let current = root;
  for (const processId of path) {
    const process = current.processes.find((entry) => entry.id === processId);
    if (!process) {
      break;
    }
    labels.push(process.label);
    current = process.child ?? current;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      {labels.map((label, index) => (
        <div key={`${label}-${index}`} className="flex items-center gap-2">
          <Button size="sm" variant={index === labels.length - 1 ? "outline" : "ghost"} onClick={() => onNavigate(index)}>
            {label}
          </Button>
          {index < labels.length - 1 ? <span>/</span> : null}
        </div>
      ))}
    </div>
  );
}
