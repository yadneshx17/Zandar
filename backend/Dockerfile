# STAGE 1: Base (Shared Foundation)
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# STAGE 2: Dependencies (Install ALL deps including Dev)
FROM base AS dependencies
# We do NOT use --omit=dev here. We need Jest.
RUN npm ci

# STAGE 3: Test (Run Unit Tests)
FROM dependencies AS test
COPY . .
# If this command fails, the docker build fails.
RUN npm test

# STAGE 4: Production Builder (Prune to only Prod deps)
FROM base AS prod-builder
RUN npm ci --omit=dev

# STAGE 5: Final Release (The Slim Image)
FROM node:20-alpine AS release
WORKDIR /app
ENV NODE_ENV=production
USER node
# Copy only the PROD node_modules
COPY --from=prod-builder /app/node_modules ./node_modules
COPY --from=dependencies /app/package.json ./package.json
COPY . .
CMD ["node", "server.js"]