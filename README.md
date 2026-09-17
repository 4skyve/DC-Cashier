
## Cara Menjalankan


npm install
cp .env.example .env    # isi DATABASE_URL dengan connection string Supabase kamu
npm run db:generate
npm run db:push         # push schema ke database Supabase
npm run db:seed         # isi data awal (akun admin/kasir + produk contoh)
npm run dev

