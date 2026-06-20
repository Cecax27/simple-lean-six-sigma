import type { SIPOCDiagram, SIPOCItem, SIPOCProcess } from "@/types/sipoc";

interface ExportDiagramProps {
  diagram: SIPOCDiagram;
  pathLabels: string[];
}

interface ColumnProps {
  title: string;
  subtitle: string;
  items: SIPOCItem[];
}

function Column({ title, subtitle, items }: ColumnProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <header className="mb-3 border-b border-slate-200 pb-2">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h3>
        <p className="text-xs uppercase tracking-wide text-slate-500">{subtitle}</p>
      </header>
      <ul className="space-y-2">
        {items.length === 0 ? (
          <li className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-400">Sin elementos</li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
              {item.label}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

function ProcessColumn({ processes }: { processes: SIPOCProcess[] }) {
  return (
    <section className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
      <header className="mb-3 border-b border-sky-200 pb-2">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">Proceso</h3>
        <p className="text-xs uppercase tracking-wide text-slate-500">Actividades y subprocesos</p>
      </header>

      <ul className="space-y-2">
        {processes.length === 0 ? (
          <li className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-400">Sin procesos</li>
        ) : (
          processes.map((process) => (
            <li key={process.id} className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm text-slate-800">
              <p>{process.label}</p>
              {process.child ? (
                <span className="mt-1 inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-700">Con sub-SIPOC</span>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

export function ExportDiagram({ diagram, pathLabels }: ExportDiagramProps) {
  const routeText = pathLabels.join(" > ");
  const dateText = new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  return (
    <article className="w-[1600px] rounded-3xl border border-slate-200 bg-white p-8 text-slate-900">
      <header className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-sky-50 to-amber-50 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Diagrama SIPOC</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{diagram.title || "Sin titulo"}</h1>
            <p className="mt-2 text-sm text-slate-600">Ruta: {routeText}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-right">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Exportado</p>
            <p className="text-sm font-medium text-slate-700">{dateText}</p>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-5 gap-4">
        <Column title="Proveedores" subtitle="Suppliers" items={diagram.suppliers} />
        <Column title="Entradas" subtitle="Inputs" items={diagram.inputs} />
        <ProcessColumn processes={diagram.processes} />
        <Column title="Salidas" subtitle="Outputs" items={diagram.outputs} />
        <Column title="Clientes" subtitle="Customers" items={diagram.customers} />
      </main>
    </article>
  );
}
