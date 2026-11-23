# FAHRI PERSONAL UNIVERSE

Next.js 14 · TypeScript · Tailwind · Framer Motion · React Three Fiber · Gemini API · PWA

## 1. Dashboard admin
Buka `/admin` di domainmu. Dari sana kamu bisa edit profil, foto, playlist YouTube, keahlian, hobi, proyek, pengetahuan FAHRI AI, banner, tema, dan melihat statistik serta pesan masuk. Tidak perlu upload ke GitHub lagi.

Wajib di Vercel (Settings → Environment Variables), lalu Redeploy:
- `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` (database)
- `ADMIN_USERNAME` dan `ADMIN_PASSWORD` (login pertama, minimal 10 karakter)
- `GEMINI_API_KEY`, `GEMINI_MODEL`, `NEXT_PUBLIC_SITE_URL`, `VISITOR_SALT`

Keamanan: 5 kali salah login = dikunci 15 menit, sesi habis setelah 2 jam tidak aktif, cookie HttpOnly. Pasang `/admin` ke layar HP lewat menu Chrome: Instal aplikasi.

Alur edit: ubah, tekan Simpan draf, cek Pratinjau penuh, lalu Publikasikan. Banner dan saklar banner berlaku langsung.

## 2. Cek konfigurasi
- `/api/health` untuk cek key, model, dan database.
- `/api/health?test=1` untuk tes Gemini sungguhan (harus `gemini_test: "ok"`).

## 3. Update dari versi lama (Codespaces)
```bash
rm -rf src && unzip -o u.zip && cp -r fahri-personal-universe/. . && rm -rf fahri-personal-universe u.zip
git add -A && git commit -m "v4 admin" && git push
```

## 4. Grafis
Tombol kecil di kanan atas (Hemat / Normal / HD) mengatur kualitas planet 3D dan partikel. Kalau HP panas, pilih Hemat.
