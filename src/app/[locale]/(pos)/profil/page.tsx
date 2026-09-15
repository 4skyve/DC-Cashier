import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOwnProfile } from "@/actions/profile";
import ProfileForm from "./ProfileForm";

export default async function ProfilPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();
  if (!session) redirect(`/${locale}/login`);

  const user = await getOwnProfile();

  return (
    <div className="max-w-md space-y-4">
      <div>
        <h1 className="text-xl font-bold text-primary-800">Profil Saya</h1>
        <p className="text-sm text-neutral-400">
          {session.role === "admin"
            ? "Ubah foto, username, dan kata sandi akun Anda."
            : "Foto profil dapat diganti. Username dan kata sandi hanya dapat diubah oleh Admin."}
        </p>
      </div>
      <ProfileForm locale={locale} session={session} user={user} />
    </div>
  );
}
