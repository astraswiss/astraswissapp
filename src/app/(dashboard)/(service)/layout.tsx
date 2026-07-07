import { ServiceNav } from "@/components/layout/service-nav";
import { ChatDock } from "@/components/chat/chat-dock";
import { DocumentPreviewProvider } from "@/lib/chat/document-preview-context";

export default function ServiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <DocumentPreviewProvider>
      <div className="flex flex-col gap-6 lg:h-full lg:min-h-0">
        <ServiceNav />
        <div className="flex min-h-0 flex-col gap-6 lg:grid lg:flex-1 lg:grid-cols-5 lg:items-stretch">
          <div className="min-w-0 lg:col-span-3 lg:overflow-y-auto">{children}</div>
          <div className="lg:col-span-2 lg:min-h-0">
            <ChatDock />
          </div>
        </div>
      </div>
    </DocumentPreviewProvider>
  );
}
