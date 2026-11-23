import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fahri Admin",
  manifest: "/admin-manifest.json",
  robots: { index: false, follow: false },
};
export default function AdminLayout({ children }: { children: React.ReactNode }) { return children; }
