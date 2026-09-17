import PortalNavbar from "@/components/portal/Navbar";
import PortalFooter from "@/components/portal/Footer";

// import CaesAiWidget from "@/components/portal/CaesAiWidget";

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen flex flex-col">
      <PortalNavbar locale={locale} />
      <main className="flex-1">{children}</main>
      <PortalFooter locale={locale} />
      {/* <CaesAiWidget /> */}
    </div>
  );
}
