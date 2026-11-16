# peluk (Satu Layar)

Asisten pribadi untuk waktu, belajar, dan uang. Tulis atau ucapkan, tersusun sendiri.

## Pasang di GitHub Pages
1. Repo `peluk` (Public) -> upload semua file (termasuk `app.js`) -> Commit.
2. Settings -> Pages -> Deploy from a branch -> `main` / root -> Save.
3. Buka `https://USERNAME.github.io/peluk/` di HP dan Mac, lalu pasang ke layar utama.

## API key (di tiap perangkat, satu kali)
Atur -> pilih mesin AI -> tempel key.
- Claude: console.anthropic.com (isi saldo, pasang batas bulanan)
- Gemini: aistudio.google.com/apikey

## Keamanan
- Key dan data hanya di browser perangkat. Repo publik hanya berisi kode.
- Content Security Policy aktif: aplikasi hanya boleh menghubungi api.anthropic.com dan generativelanguage.googleapis.com.
- Semua teks dari AI dan dari file cadangan disaring sebelum ditampilkan.
- Sidik jari = gerbang di perangkat, bukan enkripsi. Jangan pakai di komputer bersama.
- HP hilang atau key bocor: cabut (revoke) key di dashboard penyedia, lalu buat baru.
- Jangan pernah menaruh API key di file atau repo.
