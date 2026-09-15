// "use client";

// import Link from "next/link";
// import { useMemo, useState } from "react";

// type Product = {
//   id: string;
//   name: string;
//   price: number;
//   stock: number;
//   barcode: string | null;
//   imageUrl: string | null;
//   createdAt: string;
//   category: {
//     id: string;
//     name: string;
//   } | null;
// };

// type Category = {
//   id: string;
//   name: string;
// };

// type Props = {
//   locale: string;
//   products: Product[];
//   categories: Category[];
// };

// const PER_PAGE = 12;

// export default function KatalogClient({
//   locale,
//   products,
//   categories,
// }: Props) {
//   const [categoryId, setCategoryId] = useState("all");
//   const [sort, setSort] = useState("newest");
//   const [page, setPage] = useState(1);
//   const [showCategories, setShowCategories] = useState(false);
//   const [view, setView] = useState<"grid" | "list">("grid");

//   /* =========================
//      FILTER + SORT
//   ========================= */

//   const filteredProducts = useMemo(() => {
//     const result = products.filter((product) => {
//       if (categoryId === "all") return true;

//       return product.category?.id === categoryId;
//     });

//     return [...result].sort((a, b) => {
//       switch (sort) {
//         case "newest":
//           return (
//             new Date(b.createdAt).getTime() -
//             new Date(a.createdAt).getTime()
//           );

//         case "name-asc":
//           return a.name.localeCompare(b.name);

//         case "name-desc":
//           return b.name.localeCompare(a.name);

//         case "price-asc":
//           return a.price - b.price;

//         case "price-desc":
//           return b.price - a.price;

//         case "stock-desc":
//           return b.stock - a.stock;

//         default:
//           return 0;
//       }
//     });
//   }, [products, categoryId, sort]);

//   /* =========================
//      PAGINATION
//   ========================= */

//   const totalPages = Math.max(
//     1,
//     Math.ceil(filteredProducts.length / PER_PAGE)
//   );

//   const currentPage = Math.min(page, totalPages);

//   const displayedProducts = filteredProducts.slice(
//     (currentPage - 1) * PER_PAGE,
//     currentPage * PER_PAGE
//   );

//   function selectCategory(id: string) {
//     setCategoryId(id);
//     setPage(1);
//     setShowCategories(false);
//   }

//   function changeSort(value: string) {
//     setSort(value);
//     setPage(1);
//   }

//   function formatPrice(price: number) {
//     return new Intl.NumberFormat("id-ID", {
//       style: "currency",
//       currency: "IDR",
//       maximumFractionDigits: 0,
//     }).format(price);
//   }

//   /* =========================
//      CATEGORY
//   ========================= */

//   const mainCategories = categories.slice(0, 6);
//   const otherCategories = categories.slice(6);

//   const selectedCategory = categories.find(
//     (category) => category.id === categoryId
//   );

//   const selectedIsOther =
//     categoryId !== "all" &&
//     !mainCategories.some(
//       (category) => category.id === categoryId
//     );

//   /* =========================
//      PAGINATION ITEMS
//   ========================= */

//   function paginationItems() {
//     if (totalPages <= 5) {
//       return Array.from(
//         { length: totalPages },
//         (_, index) => index + 1
//       );
//     }

//     if (currentPage <= 3) {
//       return [1, 2, 3, "...", totalPages];
//     }

//     if (currentPage >= totalPages - 2) {
//       return [
//         1,
//         "...",
//         totalPages - 2,
//         totalPages - 1,
//         totalPages,
//       ];
//     }

//     return [
//       1,
//       "...",
//       currentPage,
//       "...",
//       totalPages,
//     ];
//   }

//   return (
//     <div className="mx-auto w-full max-w-[1200px] px-4 pb-14 pt-8 sm:px-6 lg:px-0">
//       {/* =========================
//           HEADER
//       ========================= */}

//       <div className="mb-5 flex items-end justify-between">
//         <div>
//           <h1 className="text-xl font-semibold tracking-tight text-[#0E2F55]">
//             Katalog
//           </h1>

//           <p className="mt-1 text-xs text-[#8891A3]">
//             Pilih produk yang tersedia
//           </p>
//         </div>

//         <span className="text-xs text-[#8891A3]">
//           {filteredProducts.length} produk
//         </span>
//       </div>

//       {/* =========================
//           FILTER BAR
//       ========================= */}

//       <div className="mb-6 flex items-center gap-2.5">
//         {/* CATEGORY */}

//         <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
//           <button
//             type="button"
//             onClick={() => selectCategory("all")}
//             className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
//               categoryId === "all"
//                 ? "bg-[#1F416B] text-white"
//                 : "bg-[#F3F5F7] text-[#535C69] hover:bg-[#E9EDF1]"
//             }`}
//           >
//             Semua
//           </button>

//           {mainCategories.map((category) => (
//             <button
//               key={category.id}
//               type="button"
//               onClick={() => selectCategory(category.id)}
//               className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
//                 categoryId === category.id
//                   ? "bg-[#1F416B] text-white"
//                   : "bg-[#F3F5F7] text-[#535C69] hover:bg-[#E9EDF1]"
//               }`}
//             >
//               {category.name}
//             </button>
//           ))}

//           {/* KATEGORI LAINNYA */}

//           {otherCategories.length > 0 && (
//             <div className="relative shrink-0">
//               <button
//                 type="button"
//                 onClick={() =>
//                   setShowCategories(!showCategories)
//                 }
//                 className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
//                   selectedIsOther
//                     ? "bg-[#1F416B] text-white"
//                     : "bg-[#F3F5F7] text-[#535C69] hover:bg-[#E9EDF1]"
//                 }`}
//               >
//                 {selectedIsOther
//                   ? selectedCategory?.name
//                   : "Lainnya"}

//                 <span className="ml-1">
//                   {showCategories ? "⌃" : "⌄"}
//                 </span>
//               </button>

//               {showCategories && (
//                 <div className="absolute left-0 top-full z-50 mt-2 max-h-72 w-60 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl">
//                   {otherCategories.map((category) => (
//                     <button
//                       key={category.id}
//                       type="button"
//                       onClick={() =>
//                         selectCategory(category.id)
//                       }
//                       className={`block w-full rounded-lg px-3 py-2 text-left text-xs transition ${
//                         categoryId === category.id
//                           ? "bg-[#EFF5FF] font-semibold text-[#1F416B]"
//                           : "text-[#535C69] hover:bg-[#F7F8FA]"
//                       }`}
//                     >
//                       {category.name}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* SORT */}

//         <select
//           value={sort}
//           onChange={(event) =>
//             changeSort(event.target.value)
//           }
//           className="shrink-0 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-[#535C69] outline-none focus:border-[#1F416B]"
//         >
//           <option value="newest">Terbaru</option>
//           <option value="name-asc">Nama A-Z</option>
//           <option value="name-desc">Nama Z-A</option>
//           <option value="price-asc">
//             Harga Terendah
//           </option>
//           <option value="price-desc">
//             Harga Tertinggi
//           </option>
//           <option value="stock-desc">
//             Stok Terbanyak
//           </option>
//         </select>

//         {/* VIEW SWITCHER */}

//         <div className="hidden shrink-0 items-center rounded-lg border border-neutral-200 bg-white p-1 sm:flex">
//           {/* GRID */}

//           <button
//             type="button"
//             title="Tampilan kotak"
//             onClick={() => setView("grid")}
//             className={`flex h-7 w-7 items-center justify-center rounded-md ${
//               view === "grid"
//                 ? "bg-[#EFF5FF] text-[#1F416B]"
//                 : "text-[#9AA2AE] hover:bg-neutral-50"
//             }`}
//           >
//             <svg
//               width="15"
//               height="15"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//             >
//               <rect
//                 x="3"
//                 y="3"
//                 width="7"
//                 height="7"
//                 rx="1"
//               />
//               <rect
//                 x="14"
//                 y="3"
//                 width="7"
//                 height="7"
//                 rx="1"
//               />
//               <rect
//                 x="3"
//                 y="14"
//                 width="7"
//                 height="7"
//                 rx="1"
//               />
//               <rect
//                 x="14"
//                 y="14"
//                 width="7"
//                 height="7"
//                 rx="1"
//               />
//             </svg>
//           </button>

//           {/* LIST */}

//           <button
//             type="button"
//             title="Tampilan strip"
//             onClick={() => setView("list")}
//             className={`flex h-7 w-7 items-center justify-center rounded-md ${
//               view === "list"
//                 ? "bg-[#EFF5FF] text-[#1F416B]"
//                 : "text-[#9AA2AE] hover:bg-neutral-50"
//             }`}
//           >
//             <svg
//               width="15"
//               height="15"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//             >
//               <line x1="4" y1="6" x2="20" y2="6" />
//               <line x1="4" y1="12" x2="20" y2="12" />
//               <line x1="4" y1="18" x2="20" y2="18" />
//             </svg>
//           </button>
//         </div>
//       </div>

//       {/* =========================
//           PRODUCT
//       ========================= */}

//       {displayedProducts.length === 0 ? (
//         <div className="rounded-xl border border-neutral-200 bg-white py-16 text-center">
//           <p className="text-sm text-[#8891A3]">
//             Belum ada produk.
//           </p>
//         </div>
//       ) : view === "grid" ? (
//         /* =========================
//            GRID VIEW
//         ========================= */

//         <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
//           {displayedProducts.map((product) => {
//             const stockEmpty = product.stock <= 0;
//             const stockLow =
//               product.stock > 0 &&
//               product.stock <= 10;

//             return (
//               <Link
//                 key={product.id}
//                 href={`/${locale}/produk/${product.id}`}
//                 className="group overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
//               >
//                 {/* IMAGE */}

//                 <div className="relative aspect-square overflow-hidden bg-[#F7F8F9]">
//                   {product.imageUrl ? (
//                     <img
//                       src={product.imageUrl}
//                       alt={product.name}
//                       className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
//                     />
//                   ) : (
//                     <div className="flex h-full items-center justify-center">
//                       <svg
//                         width="34"
//                         height="34"
//                         viewBox="0 0 24 24"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth="1.3"
//                         className="text-neutral-300"
//                       >
//                         <rect
//                           x="3"
//                           y="3"
//                           width="18"
//                           height="18"
//                           rx="2"
//                         />
//                         <circle
//                           cx="8.5"
//                           cy="8.5"
//                           r="1.5"
//                         />
//                         <path d="m21 15-5-5L5 21" />
//                       </svg>
//                     </div>
//                   )}

//                   {/* STOCK */}

//                   <span
//                     className={`absolute right-2 top-2 rounded-md px-2 py-1 text-[9px] font-semibold text-white ${
//                       stockEmpty
//                         ? "bg-[#C92335]"
//                         : stockLow
//                           ? "bg-[#E8890C]"
//                           : "bg-[#149D50]"
//                     }`}
//                   >
//                     {stockEmpty
//                       ? "Habis"
//                       : stockLow
//                         ? `Sisa ${product.stock}`
//                         : "Tersedia"}
//                   </span>
//                 </div>

//                 {/* CONTENT */}

//                 <div className="p-3">
//                   <p className="truncate text-[10px] uppercase tracking-wide text-[#8891A3]">
//                     {product.category?.name ??
//                       "Tanpa kategori"}
//                   </p>

//                   <h2 className="mt-1 line-clamp-2 min-h-[34px] text-[13px] font-semibold leading-[17px] text-[#182235]">
//                     {product.name}
//                   </h2>

//                   <p className="mt-3 text-[14px] font-bold text-[#1F416B]">
//                     {formatPrice(product.price)}

//                     <span className="ml-1 text-[10px] font-normal text-[#8891A3]">
//                       / Pcs
//                     </span>
//                   </p>

//                   <div className="mt-3 rounded-lg bg-[#1F416B] py-2.5 text-center text-xs font-medium text-white transition group-hover:bg-[#173555]">
//                     Lihat Detail
//                   </div>
//                 </div>
//               </Link>
//             );
//           })}
//         </div>
//       ) : (
//         /* =========================
//            LIST / STRIP VIEW
//         ========================= */

//         <div className="space-y-2.5">
//           {displayedProducts.map((product) => {
//             const stockEmpty = product.stock <= 0;
//             const stockLow =
//               product.stock > 0 &&
//               product.stock <= 10;

//             return (
//               <Link
//                 key={product.id}
//                 href={`/${locale}/produk/${product.id}`}
//                 className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-2.5 transition hover:border-neutral-300 hover:shadow-sm sm:p-3"
//               >
//                 {/* IMAGE */}

//                 <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[#F7F8F9] sm:h-28 sm:w-28">
//                   {product.imageUrl ? (
//                     <img
//                       src={product.imageUrl}
//                       alt={product.name}
//                       className="h-full w-full object-contain p-2"
//                     />
//                   ) : (
//                     <div className="flex h-full items-center justify-center">
//                       <svg
//                         width="28"
//                         height="28"
//                         viewBox="0 0 24 24"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth="1.3"
//                         className="text-neutral-300"
//                       >
//                         <rect
//                           x="3"
//                           y="3"
//                           width="18"
//                           height="18"
//                           rx="2"
//                         />
//                         <circle
//                           cx="8.5"
//                           cy="8.5"
//                           r="1.5"
//                         />
//                         <path d="m21 15-5-5L5 21" />
//                       </svg>
//                     </div>
//                   )}

//                   <span
//                     className={`absolute left-1.5 top-1.5 rounded-md px-1.5 py-1 text-[8px] font-semibold text-white ${
//                       stockEmpty
//                         ? "bg-[#C92335]"
//                         : stockLow
//                           ? "bg-[#E8890C]"
//                           : "bg-[#149D50]"
//                     }`}
//                   >
//                     {stockEmpty
//                       ? "Habis"
//                       : `Sisa ${product.stock}`}
//                   </span>
//                 </div>

//                 {/* INFO */}

//                 <div className="min-w-0 flex-1">
//                   <p className="truncate text-[10px] uppercase tracking-wide text-[#8891A3]">
//                     {product.category?.name ??
//                       "Tanpa kategori"}
//                   </p>

//                   <h2 className="mt-1 line-clamp-2 text-sm font-semibold text-[#182235] sm:text-[15px]">
//                     {product.name}
//                   </h2>

//                   <p className="mt-2 text-sm font-bold text-[#1F416B]">
//                     {formatPrice(product.price)}
//                   </p>
//                 </div>

//                 {/* STOCK */}

//                 <div className="hidden text-right sm:block">
//                   <p className="text-[10px] text-[#8891A3]">
//                     Stok
//                   </p>

//                   <p
//                     className={`mt-1 text-sm font-semibold ${
//                       stockEmpty
//                         ? "text-[#C92335]"
//                         : stockLow
//                           ? "text-[#E8890C]"
//                           : "text-[#149D50]"
//                     }`}
//                   >
//                     {product.stock}
//                   </p>
//                 </div>

//                 {/* DETAIL */}

//                 <div className="hidden shrink-0 rounded-lg bg-[#1F416B] px-5 py-2.5 text-xs font-medium text-white sm:block">
//                   Lihat Detail
//                 </div>

//                 <svg
//                   width="16"
//                   height="16"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   className="mr-1 shrink-0 text-[#AAB1BC] sm:hidden"
//                 >
//                   <path d="m9 18 6-6-6-6" />
//                 </svg>
//               </Link>
//             );
//           })}
//         </div>
//       )}

//       {/* =========================
//           PAGINATION
//       ========================= */}

//       {totalPages > 1 && (
//         <div className="mt-8 flex items-center justify-center gap-1">
//           <button
//             type="button"
//             disabled={currentPage === 1}
//             onClick={() =>
//               setPage(currentPage - 1)
//             }
//             className="rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-[#535C69] hover:bg-neutral-50 disabled:opacity-30"
//           >
//             ←
//           </button>

//           {paginationItems().map(
//             (item, index) => {
//               if (item === "...") {
//                 return (
//                   <span
//                     key={`dots-${index}`}
//                     className="px-1.5 text-xs text-[#8891A3]"
//                   >
//                     ...
//                   </span>
//                 );
//               }

//               return (
//                 <button
//                   key={item}
//                   type="button"
//                   onClick={() =>
//                     setPage(item as number)
//                   }
//                   className={`min-w-8 rounded-md px-2 py-1.5 text-xs font-medium ${
//                     currentPage === item
//                       ? "bg-[#1F416B] text-white"
//                       : "border border-neutral-200 bg-white text-[#535C69] hover:bg-neutral-50"
//                   }`}
//                 >
//                   {item}
//                 </button>
//               );
//             }
//           )}

//           <button
//             type="button"
//             disabled={
//               currentPage === totalPages
//             }
//             onClick={() =>
//               setPage(currentPage + 1)
//             }
//             className="rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-[#535C69] hover:bg-neutral-50 disabled:opacity-30"
//           >
//             →
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }