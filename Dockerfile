# Use an official Node.js runtime with the required version
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /appgit push origin main

# Copy the package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Build your Next.js application
RUN npm run build

# Start the application
CMD ["npm", "start"]
