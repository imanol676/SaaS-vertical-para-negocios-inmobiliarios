import { DemoProvider } from "@/src/lib/demo/DemoContext";
import { DemoHeader } from "@/src/components/demo/DemoHeader";
import { DemoSidebar } from "@/src/components/demo/DemoSidebar";
import { TourGuide } from "@/src/components/demo/TourGuide";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoProvider>
      <div className="flex min-h-screen flex-col bg-gray-50">
        <DemoHeader />
        <div className="flex flex-1 overflow-hidden">
          <DemoSidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 min-w-0 pb-32">
            {children}
          </main>
        </div>
        <TourGuide />
      </div>
    </DemoProvider>
  );
}
