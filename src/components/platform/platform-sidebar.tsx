"use client";

import {
  FileText,
  Home,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { TOOLS } from "@/tools/registry";
import { usePreferencesStore } from "@/store/preferences-store";

export function PlatformSidebar() {
  const sidebarCollapsed = usePreferencesStore((state) => state.sidebarCollapsed);
  const toggleSidebar = usePreferencesStore((state) => state.toggleSidebar);
  const setSidebarCollapsed = usePreferencesStore((state) => state.setSidebarCollapsed);

  const [mobileOpen, setMobileOpen] = useState(false);

  const pathname = usePathname();
  const params = useParams();

  const docId = params?.docId as string | undefined;

  const isActive = (href: string) =>
    href === "/inicio" ? pathname === "/inicio" : pathname.startsWith(href);

  const navItems = [
    { href: "/inicio", label: "Inicio", icon: Home },
    { href: "/docs", label: "Mis documentos", icon: FileText },
    { href: "/settings", label: "Ajustes", icon: Settings2 },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden h-full shrink-0 rounded-xl border bg-card p-3 shadow-sm transition-all duration-300 md:flex md:flex-col",
          sidebarCollapsed ? "md:w-16" : "md:w-64",
        )}
      >
        {/* Brand */}
        <div className={cn("mb-4 flex items-center", sidebarCollapsed ? "justify-center" : "justify-between")}>
          {sidebarCollapsed ? (
            <span className="text-xs font-bold text-primary">LSS</span>
          ) : (
            <span className="text-sm font-semibold leading-tight">Simple Lean Six Sigma</span>
          )}
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? "Expandir menu" : "Colapsar menu"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        </div>

        {/* Primary nav */}
        <nav className={cn("space-y-1", sidebarCollapsed ? "mb-4" : "mb-3")}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="block">
              <Button
                variant={isActive(item.href) ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start",
                  sidebarCollapsed && "justify-center px-0",
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className={cn("size-4 shrink-0", !sidebarCollapsed && "mr-2")} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Tools section */}
        {!sidebarCollapsed && (
          <>
            <div className="mb-2 px-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Herramientas
              </p>
            </div>
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
              {TOOLS.map((tool) => (
                <ToolNavLink
                  key={tool.id}
                  href={tool.hrefBase}
                  label={tool.nameEs}
                  active={pathname.startsWith(tool.hrefBase)}
                  disabled={tool.status === "soon"}
                />
              ))}
            </div>
          </>
        )}

        {sidebarCollapsed && (
          <div className="flex flex-1 flex-col items-center gap-2 py-2">
            <ToolIconLink href="/sipoc" active={pathname.startsWith("/sipoc")} />
            <div className="flex-1" />
          </div>
        )}

        {/* Active doc indicator */}
        {docId && !sidebarCollapsed && (
          <div className="mt-3 border-t pt-3">
            <p className="text-[11px] text-muted-foreground">
              Documento abierto
            </p>
          </div>
        )}
      </aside>

      {/* Mobile trigger */}
      <MobileSidebar
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        pathname={pathname}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
    </>
  );
}

function ToolNavLink({
  href,
  label,
  active,
  disabled,
}: {
  href: string;
  label: string;
  active: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground/50"
        disabled
      >
        <Wrench className="mr-2 size-4 opacity-50" />
        <span>{label}</span>
        <span className="ml-auto text-[10px] text-muted-foreground/50">Proximamente</span>
      </Button>
    );
  }

  return (
    <Link href={href} className="block">
      <Button
        variant={active ? "secondary" : "ghost"}
        size="sm"
        className="w-full justify-start"
      >
        <Wrench className="mr-2 size-4" />
        <span>{label}</span>
      </Button>
    </Link>
  );
}

function ToolIconLink({ href, active }: { href: string; active: boolean }) {
  return (
    <Link href={href}>
      <Button
        variant={active ? "secondary" : "ghost"}
        size="icon-sm"
        aria-label="SIPOC"
        title="SIPOC"
      >
        <Wrench className="size-4" />
      </Button>
    </Link>
  );
}

function MobileSidebar({
  open,
  onOpenChange,
  pathname,
  sidebarCollapsed,
  setSidebarCollapsed,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}) {
  const isActive = (href: string) =>
    href === "/inicio" ? pathname === "/inicio" : pathname.startsWith(href);

  return (
    <>
      <Button
        variant="outline"
        size="icon-sm"
        className="fixed left-3 top-3 z-40 md:hidden"
        aria-label="Abrir menu"
        onClick={() => onOpenChange(true)}
      >
        <Menu className="size-4" />
      </Button>

      <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle>Simple Lean Six Sigma</SheetTitle>
          <SheetDescription>
            Herramientas Lean Six Sigma minimalistas.
          </SheetDescription>
        </SheetHeader>
        <div className="flex h-full flex-col gap-3 p-4">
          {/* Primary nav */}
          <nav className="space-y-1">
            <Link href="/inicio" className="block">
              <Button
                variant={isActive("/inicio") ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
              >
                <Home className="mr-2 size-4" /> Inicio
              </Button>
            </Link>
            <Link href="/docs" className="block">
              <Button
                variant={isActive("/docs") ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
              >
                <FileText className="mr-2 size-4" /> Mis documentos
              </Button>
            </Link>
            <Link href="/settings" className="block">
              <Button
                variant={isActive("/settings") ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
              >
                <Settings2 className="mr-2 size-4" /> Ajustes
              </Button>
            </Link>
          </nav>

          <div className="mt-2 border-t pt-3">
            <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Herramientas
            </p>
            <div className="space-y-1">
              {TOOLS.map((tool) =>
                tool.status === "ready" ? (
                  <Link key={tool.id} href={tool.hrefBase} className="block">
                    <Button
                      variant={isActive(tool.hrefBase) ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Wrench className="mr-2 size-4" /> {tool.nameEs}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    key={tool.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground/50"
                    disabled
                  >
                    <Wrench className="mr-2 size-4 opacity-50" /> {tool.nameEs}
                    <span className="ml-auto text-[10px]">Proximamente</span>
                  </Button>
                ),
              )}
            </div>
          </div>

          <div className="mt-auto border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Menu colapsado</span>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="size-4" />
                ) : (
                  <PanelLeftClose className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
}
