"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createUser,
  updateUser,
  toggleUserActive,
  deleteUser,
} from "@/actions/user";

type UserRow = {
  id: string;
  username: string;
  role: "admin" | "kasir";
  isActive: boolean;
  avatarUrl: string | null;
};

type FormMode = "create" | "edit" | null;

export default function UserManager({
  locale,
  users,
  currentUserId,
}: {
  locale: string;
  users: UserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formMode, setFormMode] =
    useState<FormMode>(null);

  const [editUser, setEditUser] =
    useState<UserRow | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] =
    useState<"admin" | "kasir">("kasir");

  const [error, setError] =
    useState<string | null>(null);

  const totalUsers = users.length;
  const totalAdmin = users.filter(
    (u) => u.role === "admin"
  ).length;
  const totalActive = users.filter(
    (u) => u.isActive
  ).length;

  function openCreate() {
    setFormMode("create");
    setEditUser(null);
    setUsername("");
    setPassword("");
    setRole("kasir");
    setError(null);
  }

  function openEdit(user: UserRow) {
    setFormMode("edit");
    setEditUser(user);
    setUsername(user.username);
    setPassword("");
    setRole(user.role);
    setError(null);
  }

  function closeForm() {
    if (isPending) return;

    setFormMode(null);
    setEditUser(null);
    setUsername("");
    setPassword("");
    setRole("kasir");
    setError(null);
  }

  function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError(null);

    if (!username.trim()) {
      setError("Username wajib diisi.");
      return;
    }

    if (
      formMode === "create" &&
      password.length < 6
    ) {
      setError(
        "Kata sandi minimal 6 karakter."
      );
      return;
    }

    startTransition(async () => {
      try {
        if (formMode === "create") {
          await createUser(locale, {
            username: username.trim(),
            password,
            role,
          });
        }

        if (
          formMode === "edit" &&
          editUser
        ) {
          await updateUser(
            locale,
            editUser.id,
            {
              username: username.trim(),
              password,
              role,
            }
          );
        }

        closeForm();
        router.refresh();
      } catch (err) {
        if (
          err instanceof Error &&
          err.message === "USERNAME_TAKEN"
        ) {
          setError(
            "Username sudah digunakan."
          );
          return;
        }

        console.error(err);
        setError(
          "Terjadi kesalahan. Silakan coba lagi."
        );
      }
    });
  }

  function handleToggle(
    id: string,
    current: boolean
  ) {
    if (id === currentUserId) return;

    startTransition(async () => {
      try {
        await toggleUserActive(
          locale,
          id,
          !current
        );

        router.refresh();
      } catch (error) {
        console.error(error);
        alert(
          "Akun yang sedang digunakan tidak dapat dinonaktifkan."
        );
      }
    });
  }

  function handleDelete(
    id: string,
    name: string
  ) {
    if (id === currentUserId) return;

    const confirmed = window.confirm(
      `Hapus akun "${name}"?`
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteUser(locale, id);
        router.refresh();
      } catch (error) {
        console.error(error);
        alert("Gagal menghapus akun.");
      }
    });
  }

  return (
    <div className="space-y-5">

      {/* ================================================= */}
      {/* SUMMARY + HEADER ACTION */}
      {/* ================================================= */}

      <div className="flex items-start justify-between gap-3 flex-wrap">

        <div className="flex gap-3 flex-wrap">

          <div className="flex items-center gap-3 bg-white border border-neutral-200 border-l-4 border-l-primary-700 rounded-lg px-4 py-3 min-w-[150px]">
            <div className="h-9 w-9 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-primary-800 leading-none">
                {totalUsers}
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                Total Pengguna
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white border border-neutral-200 border-l-4 border-l-secondary-600 rounded-lg px-4 py-3 min-w-[150px]">
            <div className="h-9 w-9 rounded-lg bg-secondary-50 text-secondary-600 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-primary-800 leading-none">
                {totalAdmin}
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                Admin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white border border-neutral-200 border-l-4 border-l-green-500 rounded-lg px-4 py-3 min-w-[150px]">
            <div className="h-9 w-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="M22 4 12 14.01l-3-3" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-primary-800 leading-none">
                {totalActive}
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                Aktif
              </p>
            </div>
          </div>

        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 bg-primary-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-primary-800 transition shadow-sm shrink-0"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Tambah Kasir
        </button>
      </div>

      {/* ================================================= */}
      {/* FORM TAMBAH / EDIT */}
      {/* ================================================= */}

      {formMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/15 backdrop-blur-[1px] px-4">

          <div className="w-full max-w-[520px] bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden">

            {/* MODAL HEADER */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100">
              <div className="h-9 w-9 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-primary-800">
                  {formMode === "create" ? "Tambah Pengguna" : "Edit Pengguna"}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {formMode === "create" ? "Buat akun kasir atau admin baru" : "Perbarui detail akun"}
                </p>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit}>

              <div className="px-5 py-5 space-y-4">

                {/* USERNAME */}
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                    Username
                  </label>

                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value
                      )
                    }
                    placeholder="Masukkan username"
                    autoFocus
                    required
                    className="w-full h-10 border border-neutral-300 rounded-lg px-3 text-sm text-neutral-700 placeholder:text-neutral-400 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-700/10"
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                    Kata Sandi
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    placeholder={
                      formMode === "edit"
                        ? "Kosongkan jika tidak diubah"
                        : "Masukkan kata sandi"
                    }
                    required={
                      formMode === "create"
                    }
                    minLength={6}
                    className="w-full h-10 border border-neutral-300 rounded-lg px-3 text-sm text-neutral-700 placeholder:text-neutral-400 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-700/10"
                  />
                </div>

                {/* ROLE */}
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                    Role
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("kasir")}
                      className={`h-10 rounded-lg border text-sm font-medium transition ${role === "kasir"
                          ? "bg-primary-700 border-primary-700 text-white"
                          : "border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                        }`}
                    >
                      Kasir
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("admin")}
                      className={`h-10 rounded-lg border text-sm font-medium transition ${role === "admin"
                          ? "bg-primary-700 border-primary-700 text-white"
                          : "border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                        }`}
                    >
                      Admin
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-600">
                    {error}
                  </p>
                )}
              </div>

              {/* BUTTON AREA */}
              <div className="border-t border-neutral-200 bg-primary-50/60 px-5 py-3 flex justify-end gap-2">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isPending}
                  className="h-9 px-4 border border-neutral-300 bg-white text-neutral-600 text-sm font-medium rounded-lg hover:bg-neutral-50 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="h-9 px-4 bg-primary-700 text-white text-sm font-medium rounded-lg hover:bg-primary-800 disabled:opacity-50"
                >
                  {isPending
                    ? "Menyimpan..."
                    : "Simpan"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* USER TABLE */}
      {/* ================================================= */}

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-primary-50 border-b border-neutral-200">
            <tr>

              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                Username
              </th>

              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                Role
              </th>

              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                Status
              </th>

              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                Aksi
              </th>

            </tr>
          </thead>

          <tbody>

            {users.map((u) => {
              const isMe =
                u.id === currentUserId;

              return (
                <tr
                  key={u.id}
                  className="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50/50 transition"
                >

                  {/* USERNAME */}
                  <td className="px-4 py-3">

                    <div className="flex items-center gap-3">

                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold overflow-hidden shrink-0 ring-2 ${u.role === "admin"
                            ? "bg-primary-50 text-primary-700 ring-primary-100"
                            : "bg-secondary-50 text-secondary-600 ring-secondary-100"
                          }`}
                      >

                        {u.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={u.avatarUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          u.username
                            .slice(0, 1)
                            .toUpperCase()
                        )}

                      </div>

                      <div>
                        <p className="text-sm font-medium text-primary-800">
                          {u.username}

                          {isMe && (
                            <span className="ml-1.5 text-[10px] text-neutral-400 font-normal">
                              (Anda)
                            </span>
                          )}
                        </p>
                      </div>

                    </div>

                  </td>

                  {/* ROLE */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full capitalize ${u.role === "admin"
                          ? "bg-primary-50 text-primary-700"
                          : "bg-secondary-50 text-secondary-600"
                        }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-3">

                    <button
                      type="button"
                      disabled={
                        isMe || isPending
                      }
                      onClick={() =>
                        handleToggle(
                          u.id,
                          u.isActive
                        )
                      }
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${u.isActive
                          ? "bg-green-50 text-green-600"
                          : "bg-neutral-100 text-neutral-400"
                        } ${isMe
                          ? "cursor-default"
                          : "cursor-pointer hover:opacity-80"
                        } disabled:opacity-50`}
                    >
                      {u.isActive
                        ? "Aktif"
                        : "Nonaktif"}
                    </button>

                  </td>

                  {/* AKSI */}
                  <td className="px-4 py-3">

                    <div className="flex items-center justify-end gap-1.5">

                      {/* EDIT */}
                      <button
                        type="button"
                        onClick={() =>
                          openEdit(u)
                        }
                        disabled={isPending}
                        title="Edit"
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-neutral-500 hover:text-primary-700 hover:bg-primary-50 transition disabled:opacity-40"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1-1 1 1-4Z" />
                        </svg>
                      </button>

                      {/* DELETE */}
                      <button
                        type="button"
                        disabled={
                          isMe || isPending
                        }
                        onClick={() =>
                          handleDelete(
                            u.id,
                            u.username
                          )
                        }
                        title={
                          isMe
                            ? "Akun sendiri tidak dapat dihapus"
                            : "Hapus"
                        }
                        className={`h-8 w-8 flex items-center justify-center rounded-lg transition disabled:opacity-40 ${isMe
                            ? "text-neutral-300 cursor-not-allowed"
                            : "text-red-500 hover:text-red-700 hover:bg-red-50"
                          }`}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v5" />
                          <path d="M14 11v5" />
                        </svg>
                      </button>

                    </div>

                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

        {users.length === 0 && (
          <div className="py-10 text-center text-xs text-neutral-400">
            Belum ada pengguna.
          </div>
        )}

        {/* FOOTER */}
        <div className="px-4 py-2.5 border-t border-neutral-100 text-xs text-neutral-500">
          Menampilkan 1-{users.length} dari{" "}
          {users.length} pengguna
        </div>

      </div>
    </div>
  );
}