import { PlatformSidebar } from "@/components/platform/platform-sidebar";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex h-[calc(100dvh-2rem)] min-h-0 w-full max-w-7xl gap-4 overflow-hidden p-4 md:h-[calc(100dvh-3rem)] md:p-6">
      <PlatformSidebar />
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
        {children}
      </main>
    </div>
  );
}
