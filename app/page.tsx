import { Suspense } from "react";
import Header from "@/components/layout/Header";
import SearchPage from "@/components/SearchPage";

// SearchPage uses useSearchParams() which requires a Suspense boundary.
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Suspense>
        <SearchPage />
      </Suspense>
    </div>
  );
}
