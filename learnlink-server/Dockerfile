# Step 1: Use the official Node.js Alpine image (lightweight)
FROM node:18-alpine AS build

# Step 2: Set working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Install necessary Alpine packages
RUN apk add --no-cache \
  vips \
  libheif \
  jemalloc \
  python3 make g++ \
  openssl \
  libc6-compat

# Step 6: Copy the rest of the app code into the container
COPY . .

# Step 7: Set environment variables (jemalloc memory allocator)
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl

ENV LD_PRELOAD=/usr/lib/libjemalloc.so.2

# Step 8: Install Prisma Client (and generate Prisma client)
RUN npx prisma generate

# Step 9: Expose ports
EXPOSE 2020 80 443

# Step 10: Start the app
CMD ["npm", "start"]
