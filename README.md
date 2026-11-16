# Satu Layar

Asisten pribadi: tulis atau ucapkan, AI yang menyusun jadwal, alarm, dan catatan uang.

## Pasang di GitHub Pages (5 menit)
1. github.com -> New repository -> nama `satu-layar` -> Public -> Create.
2. Upload semua file di folder ini (Add file -> Upload files) -> Commit.
3. Settings -> Pages -> Source: Deploy from a branch -> `main` / root -> Save.
4. Tunggu 1-2 menit. Alamat: `https://USERNAME.github.io/satu-layar/`
5. Buka di HP dan Mac. Pasang ke layar utama:
   - Android Chrome: menu titik tiga -> Install app
   - iPhone Safari: Share -> Add to Home Screen
   - Mac Chrome: ikon install di address bar

## Pakai
1. Buka -> daftarkan sidik jari (sekali) -> masuk.
2. Atur -> pilih mesin AI -> tempel API key.
   - Claude: console.anthropic.com (model default claude-haiku-5-5, murah)
   - Gemini: aistudio.google.com/apikey (cek apakah masih ada paket gratis)
   Pasang batas pengeluaran bulanan di dashboard penyedia.
3. Ketuk lingkaran dan bicara, atau ketik di kotak bawah.

## Catatan jujur
- Kunci sidik jari adalah gerbang di perangkat ini, bukan enkripsi. Data ada di localStorage browser.
- Repo publik hanya berisi kode. API key dan data Anda tidak ikut ter-upload.
- Alarm berbunyi saat aplikasi terbuka. Untuk alarm saat tertutup: Atur -> Ekspor ke Kalender (.ics) -> buka file di HP.
- Suara memakai pengenalan suara browser (Chrome/Safari). Butuh internet.
- Cadangkan data rutin lewat Atur -> Cadangkan data.
