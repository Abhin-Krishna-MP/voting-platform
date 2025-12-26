# 1. Use the official Node.js image as the base
FROM node:20-alpine


# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package.json and package-lock.json first
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of your application code
COPY . .

# 6. Build the Next.js application
RUN npm run build

# 7. Expose port 3000 (default Next.js port)
EXPOSE 3000

# 8. Start the application
CMD ["npm", "start"]