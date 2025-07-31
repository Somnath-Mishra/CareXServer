# ----------- Build stage ------------
FROM node:18 AS builder

WORKDIR /build

COPY package*.json ./
COPY . .

RUN npm install

# ----------- Production stage ------------
FROM node:18-slim AS runner

WORKDIR /app

# Copy only what's needed to run the app
COPY --from=builder /build/package*.json ./
COPY --from=builder /build/node_modules/ ./node_modules/

COPY --from=builder /build/public ./public/
COPY --from=builder /build/src ./src/

# Cloud Run expects the container to listen on $PORT
ENV PORT=8080

# Optional: security best practice
USER node

CMD ["npm", "start"]

# https://carexserver-190794983160.us-central1.run.app
