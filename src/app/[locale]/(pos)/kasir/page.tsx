import { getActiveProducts } from "@/actions/product";
import CashierScreen from "./CashierScreen";

export default async function KasirPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = await getActiveProducts(q);

  return <CashierScreen products={products} />;
}
