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

## Sinkron antar perangkat (Supabase, gratis)
1. supabase.com -> New project (gratis). Catat region terdekat (mis. Singapore).
2. SQL Editor -> New query -> tempel isi `supabase-setup.sql` -> Run.
3. Project Settings -> API: salin **Project URL** dan kunci **anon / publishable**.
4. Di aplikasi: Atur -> Sinkron antar perangkat -> tempel URL dan kunci -> **Buat kode sinkron baru** -> Simpan dan sinkronkan.
5. Di perangkat lain: isi URL, kunci, dan **kode sinkron yang sama persis**.

Data dienkripsi (AES-GCM) di perangkat sebelum dikirim. Server hanya menyimpan teks acak. Kode sinkron tidak pernah dikirim. Kalau kode hilang, data di server tidak bisa dibuka lagi. Kunci API Claude tidak ikut disinkronkan.

## Memori dan kepribadian

- **Memori**: asisten menyimpan hal penting yang Anda ceritakan sendiri (sifat, preferensi, tujuan, orang penting, rutinitas, peristiwa besar), maksimal 80 entri. Tetap ada walau chat dihapus.
- **Layar Memori**: Pengaturan → "Memori dan kepribadian asisten". Di sana Anda bisa membaca, menambah, dan menghapus memori.
- **Kepribadian**: tulis sendiri dengan kata-kata Anda (contoh: galak tapi peduli, tenang, santai) atau pilih contoh. Hanya mengubah gaya bicara.
- Kata sandi, PIN, API key, dan nomor kartu/ID tidak pernah disimpan. Perintah "ingat ..." juga bekerja tanpa API key.
- Memori dan kepribadian ikut tersinkron (terenkripsi) antar perangkat dan masuk ekspor/impor.
