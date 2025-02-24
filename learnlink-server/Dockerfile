# Step 1: Use the official Node.js image (Debian-based)
FROM node:18 AS build

# Step 2: Set working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install
RUN apt-get update && apt-get install -y \
  libvips \
  libheif-dev \
  && rm -rf /var/lib/apt/lists/*

# Step 5: Copy the rest of the app code into the container
COPY . .

# Step 6: Install Prisma Client (and generate Prisma client)
RUN npx prisma generate

# Step 7: Expose the port your app will run on (default port 2020)
EXPOSE 2020
EXPOSE 80
EXPOSE 443

# Step 8: Start the app using npm
CMD ["npm", "start"]
