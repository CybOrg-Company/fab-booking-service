# Use the official Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies based on NODE_ENV
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

RUN if [ "$NODE_ENV" = "production" ]; then \
      npm install --only=production; \
    else \
      npm install; \
    fi

# Copy the rest of the application code
COPY . .

# Expose the application's port
EXPOSE 3000

# Use a default command, but allow override
CMD ["npm", "run", "start"]
