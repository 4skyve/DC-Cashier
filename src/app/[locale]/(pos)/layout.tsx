import { redirect } from "next/navigation";
import Sidebar from "@/components/pos/Sidebar";
import Navbar from "@/components/pos/Navbar";
import { getSession } from "@/lib/auth";

export default async function PosLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();

  if (!session) redirect(`/${locale}/login`);

  return (
    <div className="flex">
      <Sidebar locale={locale} role={session.role} />
      <div className="flex-1 min-w-0">
        <Navbar locale={locale} session={session} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
