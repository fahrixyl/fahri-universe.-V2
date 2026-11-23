import Link from "next/link";
export default function NotFound() {
  return (
    <main className="relative min-h-screen grid place-items-center bg-space overflow-hidden px-6 text-center">
      <div className="absolute inset-0 stars-css opacity-80" />
      <div className="absolute w-72 h-72 rounded-full bg-electric/20 blur-3xl top-1/4 left-1/3" />
      <div className="relative">
        <p className="font-mono text-cyan text-sm">TERSASAR DI SEMESTA</p>
        <h1 className="font-display font-bold text-[7rem] sm:text-[10rem] leading-none bg-gradient-to-b from-ink to-electric bg-clip-text text-transparent">404</h1>
        <p className="text-mute mt-2 max-w-sm mx-auto">Halaman yang kamu cari tidak ada di semesta ini. Mungkin tautannya salah atau halamannya sudah dipindahkan.</p>
        <Link href="/" className="btn btn-primary mt-8">Kembali ke beranda</Link>
      </div>
    </main>
  );
}
