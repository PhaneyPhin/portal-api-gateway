# ----------- Stage 1: Build -----------
FROM node:21-alpine AS builder

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the NestJS app
RUN npm run build

# ----------- Stage 2: Production -----------
FROM node:21-alpine AS production

WORKDIR /app

# Copy only needed files
COPY package*.json ./
COPY views /app/views
RUN npm install --omit=dev

# Copy compiled app
COPY --from=builder /app/dist ./dist

# Default command
CMD ["node", "dist/main"]
