// [brand]/sales/item 페이지 - Pages Router
import { useRouter } from 'next/router';

export default function BrandSalesItem() {
  const router = useRouter();
  const { brand } = router.query;
  
  return (
    <div>
      <h1>{brand} Sales Item Page</h1>
      <p>This is a dynamic route page using Pages Router.</p>
      <p>Brand: {brand}</p>
    </div>
  );
}