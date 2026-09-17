"use client";

import { usePathname, useRouter } from "next/navigation";

/*switch bahasa ID/EN, default ID, hanya UI level. (label statis) data yang diinput pengguna tidak diterjemahkan.*/
export default function LocaleSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: string) {
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/"));
  }

  return (
    <div className="flex items-center rounded-full border border-neutral-200 overflow-hidden text-xs font-medium">
      <button
        onClick={() => switchTo("id")}
        className={`px-3 py-1.5 ${locale === "id" ? "bg-primary-700 text-white" : "text-neutral-500"}`}
      >
        ID
      </button>
      <button
        onClick={() => switchTo("en")}
        className={`px-3 py-1.5 ${locale === "en" ? "bg-primary-700 text-white" : "text-neutral-500"}`}
      >
        EN
      </button>
    </div>
  );
}
