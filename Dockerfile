FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy prisma schema. Ini penting untuk langkah generate.
COPY prisma ./prisma/

# Install SEMUA dependencies (termasuk devDependencies agar 'prisma' CLI ada)
# LALU jalankan prisma generate
RUN npm install && npx prisma generate

# Migrate db
RUN npx prisma migrate deploy && npx prisma db seed

# Copy sisa source code Anda
COPY . .

EXPOSE 5000

CMD ["node", "server/index.js"]
