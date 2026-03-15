import { AgentSidebar } from "../../components/AgentSidebar";
import DashboardHeader from "../../components/DashboardHeader";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <DashboardHeader />
      <div className="flex flex-1">
        <AgentSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
