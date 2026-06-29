"use client";

import { Info, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ishikawaTooltips } from "@/tools/ishikawa/ishikawa-tooltips";
import type { IshikawaCause } from "@/tools/ishikawa/types";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  categoryId: string;
  label: string;
  causes: IshikawaCause[];
  index: number;
  totalCategories: number;
  onRename: (categoryId: string, label: string) => void;
  onRemove: (categoryId: string) => void;
  onMoveUp: (categoryId: string) => void;
  onMoveDown: (categoryId: string) => void;
  onAddCause: (categoryId: string, label: string) => void;
  onRemoveCause: (categoryId: string, causeId: string) => void;
  onRenameCause: (categoryId: string, causeId: string, label: string) => void;
  onSetCauseDescription: (categoryId: string, causeId: string, description: string) => void;
}

export function CategoryCard({
  categoryId,
  label,
  causes,
  index,
  totalCategories,
  onRename,
  onRemove,
  onMoveUp,
  onMoveDown,
  onAddCause,
  onRemoveCause,
  onRenameCause,
  onSetCauseDescription,
}: CategoryCardProps) {
  const [causeValue, setCauseValue] = useState("");
  const [editingLabel, setEditingLabel] = useState(false);
  const [editLabel, setEditLabel] = useState(label);

  function handleAddCause() {
    const trimmed = causeValue.trim();
    if (!trimmed) return;
    onAddCause(categoryId, trimmed);
    setCauseValue("");
  }

  function handleSaveLabel() {
    const trimmed = editLabel.trim();
    if (trimmed) onRename(categoryId, trimmed);
    else setEditLabel(label);
    setEditingLabel(false);
  }

  return (
    <Card className="bg-card/80">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {editingLabel ? (
            <Input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onBlur={handleSaveLabel}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveLabel();
                if (e.key === "Escape") {
                  setEditLabel(label);
                  setEditingLabel(false);
                }
              }}
              className="h-7 w-36 text-sm font-semibold"
              autoFocus
            />
          ) : (
            <CardTitle
              className="cursor-pointer text-sm font-semibold hover:underline"
              onClick={() => {
                setEditLabel(label);
                setEditingLabel(true);
              }}
              title="Clic para renombrar"
            >
              {label}
            </CardTitle>
          )}
          <Tooltip>
            <TooltipTrigger>
              <span className="inline-flex cursor-default">
                <Info className="size-3 text-muted-foreground/60" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-64 text-xs">
                {ishikawaTooltips[`category_${label.toLowerCase().replace(/\s+/g, "")}`]?.tip ??
                  "Categoria principal de causas que influyen en el efecto."}
              </p>
            </TooltipContent>
          </Tooltip>
          <div className="ml-auto flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onMoveUp(categoryId)}
              disabled={index === 0}
              title="Mover arriba"
            >
              <span className="text-xs">&#8593;</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onMoveDown(categoryId)}
              disabled={index === totalCategories - 1}
              title="Mover abajo"
            >
              <span className="text-xs">&#8595;</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onRemove(categoryId)}
              className="text-rose-600 hover:text-rose-700"
              title="Eliminar categoria"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {/* Add cause input */}
        <div className="flex items-center gap-2">
          <Input
            value={causeValue}
            onChange={(e) => setCauseValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddCause();
            }}
            placeholder="Agregar causa..."
            className="h-8 text-sm"
          />
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleAddCause}
            disabled={!causeValue.trim()}
            title="Agregar causa"
            className="shrink-0 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <Plus className="size-3.5" />
          </Button>
        </div>

        {/* Cause list */}
        {causes.length === 0 ? (
          <p className="py-2 text-center text-xs text-muted-foreground">Sin causas</p>
        ) : (
          <ul className="space-y-1.5">
            {causes.map((cause) => (
              <CauseRow
                key={cause.id}
                cause={cause}
                categoryId={categoryId}
                onRemove={onRemoveCause}
                onRename={onRenameCause}
                onSetDescription={onSetCauseDescription}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function CauseRow({
  cause,
  categoryId,
  onRemove,
  onRename,
  onSetDescription,
}: {
  cause: IshikawaCause;
  categoryId: string;
  onRemove: (categoryId: string, causeId: string) => void;
  onRename: (categoryId: string, causeId: string, label: string) => void;
  onSetDescription: (categoryId: string, causeId: string, description: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(cause.label);
  const [expanded, setExpanded] = useState(false);
  const [descValue, setDescValue] = useState(cause.description ?? "");

  function handleSave() {
    const trimmed = editValue.trim();
    if (trimmed) onRename(categoryId, cause.id, trimmed);
    else setEditValue(cause.label);
    setEditing(false);
  }

  function handleSaveDescription() {
    onSetDescription(categoryId, cause.id, descValue);
  }

  return (
    <li className="rounded-md border bg-card p-2">
      <div className="flex items-center gap-1.5">
        {editing ? (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setEditValue(cause.label);
                setEditing(false);
              }
            }}
            className="h-6 flex-1 text-xs"
            autoFocus
          />
        ) : (
          <span
            className="flex-1 cursor-pointer text-xs hover:underline"
            onClick={() => {
              setEditValue(cause.label);
              setEditing(true);
            }}
            title="Clic para editar"
          >
            {cause.label}
          </span>
        )}
        <Tooltip>
          <TooltipTrigger>
            <span className="inline-flex cursor-default">
              <Info className="size-3 text-muted-foreground/60" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-56 text-xs">{ishikawaTooltips.cause.tip}</p>
          </TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setExpanded(!expanded)}
          className={cn("text-muted-foreground", expanded && "text-primary")}
          title="Detalles de la causa"
        >
          <span className="text-[10px]">{expanded ? "▲" : "▼"}</span>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(categoryId, cause.id)}
          className="text-rose-600 hover:text-rose-700"
          title="Eliminar causa"
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
      {expanded && (
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center gap-1">
            <Label className="text-[11px] text-muted-foreground">Descripcion</Label>
            <Tooltip>
              <TooltipTrigger>
                <span className="inline-flex cursor-default">
                  <Info className="size-2.5 text-muted-foreground/60" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-48 text-xs">{ishikawaTooltips.cause_description.tip}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Textarea
            value={descValue}
            onChange={(e) => setDescValue(e.target.value)}
            onBlur={handleSaveDescription}
            placeholder="Detalles adicionales sobre esta causa..."
            className="h-16 text-xs"
          />
        </div>
      )}
    </li>
  );
}
