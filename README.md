# Backend Sinaridesa

Backend service untuk aplikasi Sinaridesa. Dibangun dengan Node.js, Express, dan Prisma.

## Persyaratan

- Node.js (v18 atau lebih baru)
- PostgreSQL
- npm

## Instalasi

1.  **Clone repositori:**

    ```bash
    git clone https://github.com/user/backend-sinaridesa.git
    cd backend-sinaridesa
    ```

2.  **Install dependensi:**
    ```bash
    npm install
    ```

## Konfigurasi

1.  **Buat file `.env`** di root direktori proyek dan salin konten dari `.env.example` (jika ada) atau gunakan template di bawah.

2.  **Atur variabel lingkungan** dalam file `.env`:

    ```env
    # URL Koneksi Database PostgreSQL
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

    # Secret untuk JWT
    JWT_SECRET="your-super-secret-key"

    # Kunci API (jika digunakan)
    API_KEY="your-api-key"

    # Seperti di .env.example
    ```

---

## Mode Produksi (Jika mau developt skip aja nginxnya sampai build docker udah cukup runnning!)

Untuk men-deploy aplikasi ke server produksi (misalnya VM):

1.  **Pastikan semua kode terbaru ada di server:**

    ```bash
    git pull origin main
    ```

2.  **Jalankan build docker :**

    ```bash
    npm run docker:build
    ```

3.  **Pastikan file `.env` sudah dikonfigurasi** dengan benar untuk lingkungan produksi (database produksi, secret yang kuat, dll.).

4.  **Buat config nginx:**
    Perintah ini akan menerapkan migrasi yang ada ke database produksi Anda.

    1. sudo nano /etc/nginx/sites-available/backend-sinaridesa
    masukan script dibawah!

    ```bash
    server {
    listen 80;
    listen [::]:80;

        # Ganti domain_anda.com dengan nama domain atau alamat IP publik VM Anda
        server_name domain_anda.com www.domain_anda.com;

        location / {
            # Teruskan request ke aplikasi Node.js yang berjalan di port 5001
            proxy_pass http://localhost:5001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

    }
    ```

    2. sudo ln -s /etc/nginx/sites-available/backend-sinaridesa /etc/nginx/sites-enabled/

5.  **Restart nginx dan test pastikan ok:**

    ```bash
    sudo systemctl restart nginx

    sudo nginx -t
    ```

## Skrip NPM

- `npm start`: Menjalankan server untuk produksi.
- `npm run dev`: Menjalankan server dalam mode pengembangan dengan `nodemon`.
- `npm run docker:build:` : build docker
- `prisma:migrate`: Alias untuk `npx prisma migrate dev`.
- `prisma:deploy`: Alias untuk `npx prisma migrate deploy`.
- `prisma:generate`: Alias untuk `npx prisma generate`.
