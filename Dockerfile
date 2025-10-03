FROM node:18-alpine

WORKDIR /app

# Copy package.json
COPY package*.json ./

# Install dependencies
RUN npm install --production && npm cache clean --force

# Copy semua source code
COPY . .

EXPOSE 5000

CMD ["node", "server/index.js"]