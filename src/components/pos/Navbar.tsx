import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import MobileNav from "./MobileNav";
import NavSearch from "./NavSearch";
import ProfileMenu from "./ProfileMenu";
import { prisma } from "@/lib/prisma";
import type { Session } from "@/lib/auth";

export default async function Navbar({
  locale,
  session,
}: {
  locale: string;
  session: Session;
}) {
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { avatarUrl: true },
  });

  return (
    <header className="h-16 border-b border-neutral-100 bg-white flex items-center justify-between px-4 md:px-6 gap-3 sticky top-0 z-20">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <MobileNav locale={locale} role={session.role} />
        <NavSearch />
      </div>
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <div className="hidden md:block">
          <LocaleSwitcher locale={locale} />
        </div>
        <ProfileMenu locale={locale} session={session} avatarUrl={user?.avatarUrl ?? null} />
      </div>
    </header>
  );
}
