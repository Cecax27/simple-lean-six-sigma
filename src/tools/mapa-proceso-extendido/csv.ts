import type { ProcessMap } from "@/tools/mapa-proceso-extendido/types";

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  start: "Inicio",
  process: "Proceso",
  decision: "Decisión",
  end: "Fin",
};

function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function serializeToCsv(map: ProcessMap): string {
  const headers = [
    "ID",
    "Etapa",
    "Responsable",
    "Nombre",
    "Descripción",
    "Tipo",
    "Actividades Siguientes",
  ];

  const departmentNames = new Map(map.departments.map((d) => [d.id, d.name]));
  const stageNames = new Map(map.stages.map((s) => [s.id, s.name]));

  const rows = map.activities.map((act) => {
    const stage = stageNames.get(act.stageId) ?? act.stageId;
    const dept = departmentNames.get(act.departmentId) ?? act.departmentId;
    const next = act.nextIds.join(";");
    const typeLabel = ACTIVITY_TYPE_LABELS[act.type] ?? act.type;

    return [
      act.id,
      stage,
      dept,
      act.name,
      act.description ?? "",
      typeLabel,
      next,
    ].map(escapeCsvField);
  });

  const csv = [headers.map(escapeCsvField).join(",")]
    .concat(rows.map((row) => row.join(",")))
    .join("\n");

  return csv;
}
