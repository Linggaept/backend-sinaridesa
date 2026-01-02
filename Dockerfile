# ---- Base Stage ----
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---- Dependencies Stage ----
FROM base AS dependencies
# Install all dependencies including devDependencies for build steps like prisma generate
RUN npm install
# Copy prisma schema to generate client
COPY prisma ./prisma/
RUN npx prisma generate

# ---- Production Stage ----
FROM base AS production
# Copy only production dependencies from the dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
# Ensure the generated client is included if it's not in node_modules by default
COPY --from=dependencies /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 5001

# The command from docker-compose will override this, but it's good practice to have it.
CMD ["sh", "-c", "npx prisma migrate deploy && node server/index.js"]
