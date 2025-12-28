import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppHeader } from "@/components/app-header"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import DbSidebar from "@/components/dashboard/db-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }>
      <AppSidebar variant="inset" className="bg-zinc-900"/>
      <SidebarInset>
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          <ResizablePanel defaultSize={75} minSize={50}>
            <div className="flex flex-col h-full bg-white rounded-l-xl">
              <AppHeader />
              <div className="flex flex-1 flex-col gap-4 p-4">
                {children}
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle className="text-orange-500" />
          
          <ResizablePanel defaultSize={20} minSize={16} maxSize={25}>
            <DbSidebar />
          </ResizablePanel>
        </ResizablePanelGroup>
      </SidebarInset>
    </SidebarProvider>
  )
}
