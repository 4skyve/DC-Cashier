"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createUser,
  updateUser,
} from "@/actions/user";

type Props =
  | {
      locale: string;
      mode: "create";
    }
  | {
      locale: string;
      mode: "edit";
      user: {
        id: string;
        username: string;
        role: "admin" | "kasir";
      };
    };

export default function UserForm(
  props: Props
) {
  const router = useRouter();

  const [username, setUsername] = useState(
    props.mode === "edit"
      ? props.user.username
      : ""
  );

  const [password, setPassword] =
    useState("");

  const [role, setRole] = useState<
    "admin" | "kasir"
  >(
    props.mode === "edit"
      ? props.user.role
      : "kasir"
  );

  const [error, setError] = useState<
    string | null
  >(null);

  const [isPending, startTransition] =
    useTransition();

  function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError(null);

    startTransition(async () => {
      try {
        if (props.mode === "create") {
          await createUser(props.locale, {
            username,
            password,
            role,
          });
        } else {
          await updateUser(
            props.locale,
            props.user.id,
            {
              username,
              password,
              role,
            }
          );
        }

        router.push(
          `/${props.locale}/pengguna`
        );
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

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[520px] bg-white border border-neutral-200 rounded-xl overflow-hidden"
    >
      {/* FORM CONTENT */}
      <div className="p-5 space-y-4">
        {/* USERNAME */}
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            placeholder="Masukkan username"
            required
            className="w-full h-9 border border-neutral-200 rounded-md px-3 text-sm outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-100"
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
              setPassword(e.target.value)
            }
            placeholder="Masukkan kata sandi"
            required={props.mode === "create"}
            minLength={6}
            className="w-full h-9 border border-neutral-200 rounded-md px-3 text-sm outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-100"
          />

          {props.mode === "edit" && (
            <p className="text-[10px] text-neutral-400 mt-1">
              Kosongkan jika tidak ingin mengubah kata sandi.
            </p>
          )}
        </div>

        {/* ROLE */}
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">
            Role
          </label>

          <select
            value={role}
            onChange={(e) =>
              setRole(
                e.target.value as
                  | "admin"
                  | "kasir"
              )
            }
            className="w-full h-9 border border-neutral-200 rounded-md px-3 text-sm bg-white outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-100"
          >
            <option value="kasir">
              Kasir
            </option>

            <option value="admin">
              Admin
            </option>
          </select>
        </div>

        {error && (
          <p className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>

      {/* BUTTON */}
      <div className="border-t border-neutral-100 bg-primary-50/40 px-5 py-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() =>
            router.push(
              `/${props.locale}/pengguna`
            )
          }
          className="border border-neutral-300 bg-white text-neutral-600 text-xs font-medium px-4 py-2 rounded-md hover:bg-neutral-50"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="bg-primary-700 text-white text-xs font-medium px-4 py-2 rounded-md hover:bg-primary-800 disabled:opacity-50"
        >
          {isPending
            ? "Menyimpan..."
            : "Simpan"}
        </button>
      </div>
    </form>
  );
}