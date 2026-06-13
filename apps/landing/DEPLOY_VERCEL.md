# Deploy ke Vercel — Landing Page AgentPay

> Panduan ini sudah disesuaikan dengan **monorepo pnpm + Astro + TailwindCSS + workspace dependency (`agentpay-pharos`)**.  
> Ikuti langkah-langkah ini persis agar tidak gagal deploy.

---

## 1. Prasyarat

- Akun Vercel (vercel.com)
- Repo GitHub ini terhubung ke Vercel
- Root project ada di `E:\smweb\phaaros` (monorepo)

---

## 2. Konfigurasi di Vercel Dashboard

Buka [vercel.com](https://vercel.com) → **Add New Project** → Import repository ini.

### Settings yang WAJIB diisi:

| Parameter | Value |
|---|---|
| **Root Directory** | `apps/landing` |
| **Framework Preset** | Astro |
| **Build Command** | `cd ../.. && pnpm install --frozen-lockfile --ignore-scripts && pnpm --filter agentpay-pharos build && pnpm --filter landing build` |
| **Output Directory** | `dist` |
| **Install Command** | *(biarkan kosong / override via build command)* |
| **Node Version** | `22.x` (atau `20.x` minimal) |

### Environment Variables (jika perlu)

| Variable | Value | Notes |
|---|---|---|
| `NODE_VERSION` | `22` | Fallback jika setting Node Version tidak tersedia |
| `PUBLIC_SITE_URL` | `https://agentpay.vercel.app` | Sesuaikan domain nanti |

---

## 3. Penjelasan Build Command

```bash
cd ../.. && pnpm install --frozen-lockfile --ignore-scripts && pnpm --filter agentpay-pharos build && pnpm --filter landing build
```

Apa yang terjadi:

| Step | Perintah | Fungsi |
|---|---|---|
| 1 | `cd ../..` | Pindah ke root monorepo (dari `apps/landing` ke root) |
| 2 | `pnpm install --frozen-lockfile --ignore-scripts` | Install semua dependencies berdasarkan `pnpm-lock.yaml`, skip lifecycle scripts |
| 3 | `pnpm --filter agentpay-pharos build` | Build SDK workspace dependency **sebelum** landing page |
| 4 | `pnpm --filter landing build` | Build landing page dengan Astro |

> **Kenapa pakai perintah ini?**  
> Karena `agentpay-pharos` adalah workspace dependency (`"workspace:*"` di package.json).  
> Vercel tidak otomatis build workspace dependencies — harus manual.

---

## 4. `vercel.json` (Recommended)

Buat file `apps/landing/vercel.json`:

```json
{
  "framework": "astro",
  "buildCommand": "cd ../.. && pnpm install --frozen-lockfile --ignore-scripts && pnpm --filter agentpay-pharos build && pnpm --filter landing build",
  "outputDirectory": "dist",
  "installCommand": null,
  "nodeVersion": "22.x"
}
```

Dengan file ini, semua setting sudah terbaca otomatis — tidak perlu setting manual di dashboard.

---

## 5. Hal-hal yang Sering Bikin Gagal Deploy (& Solusinya)

### ❌ `ERR_PNPM_NO_MATCHING_VERSION` — versi pnpm tidak cocok

**Sebab:** Vercel pakai pnpm versi lama yang tidak support `pnpm@workspace` protocol.  
**Solusi:** Tambahkan `"packageManager"` di root `package.json`:

```json
{
  "packageManager": "pnpm@10.8.1",
  "engines": {
    "pnpm": ">=10.0.0"
  }
}
```

---

### ❌ `Cannot find module 'agentpay-pharos'`

**Sebab:** Workspace dependency `agentpay-pharos` belum di-build.  
**Solusi:** Pastikan build command menjalankan `pnpm --filter agentpay-pharos build` **sebelum** `pnpm --filter landing build`.

---

### ❌ `Sharp` install gagal / `node-gyp` error

**Sebab:** `sharp` (dependency Astro) perlu native build.  
**Solusi:** Tambahkan `--ignore-scripts` di install, lalu Vercel akan handle `sharp` secara otomatis (Vercel sudah punya prebuilt binary untuk `sharp`).

---

### ❌ `pnpm-lock.yaml` outdated

**Sebab:** Lockfile tidak sinkron dengan `package.json`.  
**Solusi:** Generate ulang lockfile lokal dan push ulang:
```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "chore: update lockfile"
git push
```

---

### ❌ Vercel build `dist/` tapi 404

**Sebab:** Vercel pakai routing default, tidak membaca output Astro dengan benar.  
**Solusi:** Pastikan `outputDirectory` di `vercel.json` adalah `dist`. Atau atur di dashboard.

---

### ❌ Build pass tapi halaman putih / blank

**Sebab:** Mungkin ada error JS runtime. Cek **Function Logs** di Vercel Dashboard setelah deploy.  
**Solusi:** Jalankan `pnpm --filter landing build` dulu secara lokal untuk lihat error:

```bash
cd apps/landing
pnpm build
```

---

### ❌ Pushing to Vercel dari Windows — Git line ending warning

**Sebab:** `git status` mendeteksi perubahan file karena `autocrlf`.  
**Solusi:** Pastikan `.gitattributes` di root:

```
* text=auto eol=lf
```

---

## 6. Test Build Lokal (Sebelum Push ke Vercel)

Jalankan ini dari **root monorepo** untuk mensimulasikan build Vercel:

```bash
# Step 1: Install dependencies
pnpm install

# Step 2: Build SDK
pnpm --filter agentpay-pharos build

# Step 3: Build landing
pnpm --filter landing build
```

Jika semua sukses tanpa error, deploy ke Vercel juga akan sukses.

Untuk preview lokal hasil build:
```bash
pnpm --filter landing preview
```

---

## 7. Deploy Pertama Kali

1. Push repo ke GitHub
2. Import project di [vercel.com/new](https://vercel.com/new)
3. Pilih **Root Directory** → `apps/landing`
4. Paste build command dari section 3 (atau pakai `vercel.json` biar otomatis)
5. Set **Node Version** → `22.x`
6. Klik **Deploy**

> **Tips:** Setelah deploy sukses, Vercel akan otomatis re-deploy setiap kali ada push ke branch default.

---

## 8. Custom Domain (Optional)

1. Buka project di Vercel Dashboard
2. **Settings** → **Domains**
3. Tambah domain (misal: `agentpay.io`)
4. Update DNS (Vercel akan kasih petunjuk)

---

## 9. File `vercel.json` Lengkap

Simpan file ini di `apps/landing/vercel.json`:

```json
{
  "framework": "astro",
  "buildCommand": "cd ../.. && pnpm install --frozen-lockfile --ignore-scripts && pnpm --filter agentpay-pharos build && pnpm --filter landing build",
  "outputDirectory": "dist",
  "installCommand": null,
  "nodeVersion": "22.x",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 10. Checklist Cepat

Sebelum deploy, pastikan:

- [ ] `pnpm install` sukses di lokal
- [ ] `pnpm --filter agentpay-pharos build` sukses
- [ ] `pnpm --filter landing build` sukses
- [ ] `pnpm-lock.yaml` sudah di-commit
- [ ] `apps/landing/vercel.json` sudah ada
- [ ] Root `package.json` punya field `"packageManager": "pnpm@10.x"`
- [ ] `node_modules` dan `dist` masuk `.gitignore`
- [ ] Git sudah clean (`git status`)
- [ ] Branch sudah di-push ke GitHub
