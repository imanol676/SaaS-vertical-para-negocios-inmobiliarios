import { Sidebar } from "../../components/Sidebar";
import DashboardHeader from "../../components/DashboardHeader";
import { TrialExpiredModal } from "../../components/TrialExpiredModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <TrialExpiredModal />
      <DashboardHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
