FROM node:18-alpine

WORKDIR /app

# Install front-end dependencies (at project root)
COPY package*.json ./
RUN npm install

# Install backend depdencies
COPY backend/ backend/
RUN cd backend && npm install
RUN cd ..

# COPY REST OF THE CODE
COPY . .
COPY .env .env

# Expose the port the app runs on
EXPOSE 8000

# Build Next.js application
RUN npm run build

# Start the application
CMD ["npm", "start"]
