"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useProcessMapStore } from "@/tools/mapa-proceso-extendido/store";
import type { ActivityType } from "@/tools/mapa-proceso-extendido/types";

const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  start: "Inicio",
  process: "Proceso",
  decision: "Decisión",
  end: "Fin",
};

const ACTIVITY_TYPES: ActivityType[] = ["start", "process", "decision", "end"];

export function ActivityTable() {
  const root = useProcessMapStore((s) => s.root);
  const addActivity = useProcessMapStore((s) => s.addActivity);
  const updateActivity = useProcessMapStore((s) => s.updateActivity);
  const removeActivity = useProcessMapStore((s) => s.removeActivity);

  const departments = root.departments;
  const stages = root.stages;
  const activities = root.activities;

  function handleAdd() {
    if (stages.length === 0 || departments.length === 0) return;
    addActivity({
      stageId: stages[0].id,
      departmentId: departments[0].id,
      name: "",
      type: "process",
      previousIds: [],
      nextIds: [],
    });
  }

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-medium">Actividades</h3>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={handleAdd}
          disabled={departments.length === 0 || stages.length === 0}
        >
          <Plus className="size-3.5" />
          Agregar actividad
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          {departments.length === 0 || stages.length === 0
            ? "Agrega al menos un departamento y una etapa para comenzar."
            : "No hay actividades. Agrega una para comenzar."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50">
                <Th>ID</Th>
                <Th>Etapa</Th>
                <Th>Responsable</Th>
                <Th>Nombre</Th>
                <Th>Descripción</Th>
                <Th>Tipo</Th>
                <Th>Previo</Th>
                <Th>Siguiente</Th>
                <Th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {activities.map((act) => (
                <ActivityRow
                  key={act.id}
                  activity={act}
                  departments={departments}
                  stages={stages}
                  allActivities={activities}
                  onUpdate={(data) => updateActivity(act.id, data)}
                  onRemove={() => removeActivity(act.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

function ActivityRow({
  activity,
  departments,
  stages,
  allActivities,
  onUpdate,
  onRemove,
}: {
  activity: ReturnType<typeof useProcessMapStore.getState>["root"]["activities"][number];
  departments: ReturnType<typeof useProcessMapStore.getState>["root"]["departments"];
  stages: ReturnType<typeof useProcessMapStore.getState>["root"]["stages"];
  allActivities: ReturnType<typeof useProcessMapStore.getState>["root"]["activities"];
  onUpdate: (data: Partial<{ name: string; description: string; stageId: string; departmentId: string; type: ActivityType; previousIds: string[]; nextIds: string[] }>) => void;
  onRemove: () => void;
}) {
  return (
    <tr className="border-b hover:bg-muted/30">
      <Td>{activity.id}</Td>
      <Td>
        <select
          value={activity.stageId}
          onChange={(e) => onUpdate({ stageId: e.target.value })}
          className="w-full h-7 rounded border border-input bg-background px-1.5 text-xs"
        >
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Td>
      <Td>
        <select
          value={activity.departmentId}
          onChange={(e) => onUpdate({ departmentId: e.target.value })}
          className="w-full h-7 rounded border border-input bg-background px-1.5 text-xs"
        >
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </Td>
      <Td>
        <input
          type="text"
          value={activity.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Nombre de la actividad"
          className="w-full h-7 rounded border border-input bg-background px-1.5 text-xs"
        />
      </Td>
      <Td>
        <input
          type="text"
          value={activity.description ?? ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Descripción"
          className="w-full h-7 rounded border border-input bg-background px-1.5 text-xs min-w-[120px]"
        />
      </Td>
      <Td>
        <select
          value={activity.type}
          onChange={(e) => onUpdate({ type: e.target.value as ActivityType })}
          className="w-full h-7 rounded border border-input bg-background px-1.5 text-xs"
        >
          {ACTIVITY_TYPES.map((type) => (
            <option key={type} value={type}>
              {ACTIVITY_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </Td>
      <Td>
        <MultiSelectCell
          selectedIds={activity.previousIds}
          options={allActivities.filter((a) => a.id !== activity.id)}
          onChange={(ids) => onUpdate({ previousIds: ids })}
        />
      </Td>
      <Td>
        <MultiSelectCell
          selectedIds={activity.nextIds}
          options={allActivities.filter((a) => a.id !== activity.id)}
          onChange={(ids) => onUpdate({ nextIds: ids })}
        />
      </Td>
      <Td>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </Td>
    </tr>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-2 py-1 ${className ?? ""}`}>
      {children}
    </td>
  );
}

function MultiSelectCell({
  selectedIds,
  options,
  onChange,
}: {
  selectedIds: string[];
  options: { id: string; name: string }[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (popupRef.current?.contains(target)) return;
      close();
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, close]);

  const selectedLabels = selectedIds
    .map((id) => options.find((o) => o.id === id)?.name ?? `ID ${id}`)
    .join(", ");

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  function handleOpen() {
    if (open) {
      close();
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const popupHeight = Math.min(192, options.length * 32 + 4);
      const openDown = spaceBelow >= popupHeight || spaceBelow > spaceAbove;

      setPopupStyle({
        position: "fixed",
        top: openDown ? rect.bottom + 4 : rect.top - popupHeight - 4,
        left: Math.max(4, Math.min(rect.left, window.innerWidth - 228)),
        width: 224,
        zIndex: 100,
      });
    }
    setOpen(true);
  }

  const popup = open && createPortal(
    <div
      ref={popupRef}
      style={popupStyle}
      className="rounded-md border bg-popover shadow-md p-1 max-h-48 overflow-y-auto"
    >
      {options.length === 0 && (
        <p className="text-xs text-muted-foreground p-2">
          No hay otras actividades
        </p>
      )}
      {options.map((opt) => (
        <label
          key={opt.id}
          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer text-xs"
        >
          <Checkbox
            checked={selectedIds.includes(opt.id)}
            onCheckedChange={() => toggle(opt.id)}
          />
          <span className="truncate">
            {opt.id} — {opt.name || "(sin nombre)"}
          </span>
        </label>
      ))}
    </div>,
    document.body,
  );

  return (
    <div>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        className="w-full h-7 rounded border border-input bg-background px-1.5 text-xs text-left truncate cursor-pointer hover:bg-muted/50 min-w-[80px]"
      >
        {selectedIds.length === 0 ? (
          <span className="text-muted-foreground">Ninguno</span>
        ) : (
          <span>{selectedLabels}</span>
        )}
      </button>
      {popup}
    </div>
  );
}
