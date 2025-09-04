# Stage 1: Build React app -----------------------------------------------------
FROM node:22-alpine AS builder

ARG VITE_APP_PREFIX=""
ENV VITE_APP_PREFIX=${VITE_APP_PREFIX}
ENV NODE_ENV=production

WORKDIR /app

# Copy package.json and package-lock.json first to leverage caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Build both the client and server
RUN npm run build


# Stage 2: Build and Run Express server ----------------------------------------
FROM node:22-alpine

ARG VITE_APP_PREFIX=""
ENV VITE_APP_PREFIX=${VITE_APP_PREFIX}
ENV NODE_ENV=production
ENV PORT=80
ENV NODE_DEBUG=app-verbose,app-error,app-info,app-warn,app-log

WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/package.json /app/package-lock.json /app/dist .

# Install only production dependencies
RUN npm ci --only=production

# Expose the necessary port
EXPOSE $PORT

# Start the server
CMD ["node", "backend/index.js"]
