# Use an official Node.js image (Debian-based for better Prisma compatibility)
FROM node:18-bullseye AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker caching
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Install Prisma CLI globally to ensure it's available
RUN npm install -g prisma@5.4.2

# Copy the rest of the application code
COPY . .

# Validate Prisma schema before generating client
RUN npx prisma validate

# Ensure Prisma uses the correct binary target
ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-1.1.x

# Generate Prisma Client
RUN npx prisma generate

# Expose necessary ports
EXPOSE 2020 80 443

# Start the application
CMD ["npm", "start"]
