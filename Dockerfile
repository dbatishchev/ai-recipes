# Use an official Node.js image as a base
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port on which Next.js runs
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "run", "start"]