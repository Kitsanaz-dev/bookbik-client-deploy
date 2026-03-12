# Base image matching user's Node version
FROM node:24-alpine

WORKDIR /app

# Install dependencies based on package-lock.json
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Expose the Vite preview port
EXPOSE 5173

# Serve the production build using Vite preview
CMD ["npm", "run", "preview", "--", "--host"]
