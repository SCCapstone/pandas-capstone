# Step 1: Use an official Node.js image from Docker Hub
FROM node:18-alpine

# Step 2: Set working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./
COPY .env ./


# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the app code into the container
COPY . .

# Step 6: Build Prisma Client
RUN npx prisma generate

# Step 7: Expose the port your app will run on (default port 2020)
EXPOSE 2020
EXPOSE 80
EXPOSE 443

# Step 8: Start the app using npm
CMD ["npm", "start"]
