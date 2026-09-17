"use client";

import { useRef, useState, useTransition } from "react";
import { updateOwnAvatar, updateOwnProfile } from "@/actions/profile";
import type { Session } from "@/lib/auth";
import type { User } from "@prisma/client";
import { Check } from "lucide-react";

export default function ProfileForm({
  locale,
  session,
  user,
}: {
  locale: string;
  session: Session;
  user: User;
}) {
  const isAdmin = session.role === "admin";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl ?? "");
  const [avatarSaving, startAvatarTransition] = useTransition();
  const [avatarSaved, setAvatarSaved] = useState(false);

  const [username, setUsername] = useState(user.username);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      setError("Ukuran gambar maksimal 1.5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatarPreview(dataUrl);
      setAvatarSaved(false);
      startAvatarTransition(async () => {
        await updateOwnAvatar(locale, dataUrl);
        setAvatarSaved(true);
      });
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await updateOwnProfile(locale, {
          username,
          newPassword: newPassword.trim() || undefined,
        });
        setNewPassword("");
        setSaved(true);
      } catch (err) {
        setError(
          err instanceof Error && err.message === "USERNAME_TAKEN"
            ? "Username sudah dipakai"
            : "Terjadi kesalahan"
        );
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Foto Profil blh diubah semua role */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary-700 overflow-hidden flex items-center justify-center text-white text-xl font-semibold shrink-0">
          {avatarPreview ? (
            
            <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
          ) : (
            user.username.slice(0, 1).toUpperCase()
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarSaving}
            className="text-sm font-medium text-primary-700 border border-neutral-200 rounded-lg px-3 py-1.5 disabled:opacity-50"
          >
            {avatarSaving ? "Menyimpan..." : "Ganti Foto"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {avatarSaved && (
            <p className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
              <Check className="w-3.5 h-3.5" /> Foto tersimpan
            </p>
          )}
        </div>
      </div>

      {/* Username & Password admin only, kasir read-only */}
      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1.5">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={!isAdmin}
            required
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm disabled:bg-neutral-50 disabled:text-neutral-400"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1.5">
            Kata Sandi Baru {isAdmin && <span className="text-neutral-400 font-normal">(kosongkan jika tidak diganti)</span>}
          </label>
          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            type="password"
            disabled={!isAdmin}
            placeholder={isAdmin ? "" : "••••••••"}
            minLength={6}
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm disabled:bg-neutral-50 disabled:text-neutral-400"
          />
        </div>

        {!isAdmin && (
          <p className="text-xs text-neutral-400 bg-neutral-50 rounded-lg px-3 py-2">
            Hanya Admin yang dapat mengubah username dan kata sandi. Hubungi Admin jika perlu diganti.
          </p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && (
          <p className="inline-flex items-center gap-1.5 text-sm text-green-600">
            <Check className="w-4 h-4" /> Profil berhasil diperbarui
          </p>
        )}

        {isAdmin && (
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg disabled:opacity-50"
          >
            Simpan Perubahan
          </button>
        )}
      </form>
    </div>
  );
}
