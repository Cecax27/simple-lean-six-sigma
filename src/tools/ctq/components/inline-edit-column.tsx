"use client";

import { Check, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InlineItemProps {
  id: string;
  label: string;
  selected?: boolean;
  onSelect: () => void;
  onRemove: (id: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
}

function InlineItem({
  id,
  label,
  selected,
  onSelect,
  onRemove,
  onUpdateLabel,
}: InlineItemProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function startEditing() {
    setEditValue(label);
    setEditing(true);
  }

  function commitEdit() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== label) {
      onUpdateLabel(id, trimmed);
    }
    setEditing(false);
  }

  return (
    <li
      className={cn(
        "flex items-center justify-between gap-2 rounded-md border p-2 text-sm cursor-pointer transition-colors",
        selected
          ? "border-primary/50 bg-primary/5 ring-1 ring-primary/25"
          : "hover:border-muted-foreground/20",
      )}
      onClick={() => onSelect()}
      role="option"
      aria-selected={selected}
    >
      {editing ? (
        <input
          ref={inputRef}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") setEditing(false);
          }}
        />
      ) : (
        <span
          className="min-w-0 flex-1 truncate"
          onDoubleClick={(e) => {
            e.stopPropagation();
            startEditing();
          }}
        >
          {label}
        </span>
      )}
      <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
        {!editing && (
          <Button
            size="icon-sm"
            variant="ghost"
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={() => setEditing(true)}
            aria-label={`Editar ${label}`}
            title={`Editar ${label}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </Button>
        )}
        <Button
          size="icon-sm"
          variant="ghost"
          className="size-7 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
          onClick={() => onRemove(id)}
          aria-label={`Eliminar ${label}`}
          title={`Eliminar ${label}`}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </li>
  );
}

interface ColumnProps {
  title: string;
  placeholder: string;
  items: { id: string; label: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (label: string) => void;
  onRemove: (id: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
  disabled?: boolean;
  disabledMessage?: string;
}

export function InlineEditColumn({
  title,
  placeholder,
  items,
  selectedId,
  onSelect,
  onAdd,
  onRemove,
  onUpdateLabel,
  disabled,
  disabledMessage,
}: ColumnProps) {
  const [value, setValue] = useState("");

  if (disabled) {
    return (
      <div className="flex min-h-0 h-full flex-col rounded-xl border bg-muted/40 p-4">
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{title}</h3>
        <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground/60">
          <p>{disabledMessage ?? "Selecciona un elemento anterior"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 h-full flex-col rounded-xl border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            const trimmed = value.trim();
            if (!trimmed) return;
            onAdd(trimmed);
            setValue("");
          }}
        />
        <Button
          variant="outline"
          size="icon-sm"
          className="shrink-0 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          onClick={() => {
            const trimmed = value.trim();
            if (!trimmed) return;
            onAdd(trimmed);
            setValue("");
          }}
          aria-label={`Agregar ${title.toLowerCase()}`}
          title={`Agregar ${title.toLowerCase()}`}
        >
          <Check className="size-4" />
        </Button>
      </div>

      <ul className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {items.map((item) => (
          <InlineItem
            key={item.id}
            id={item.id}
            label={item.label}
            selected={item.id === selectedId}
            onSelect={() => onSelect(item.id)}
            onRemove={onRemove}
            onUpdateLabel={onUpdateLabel}
          />
        ))}
        {items.length === 0 && (
          <li className="py-8 text-center text-sm text-muted-foreground">
            Sin elementos
          </li>
        )}
      </ul>
    </div>
  );
}
