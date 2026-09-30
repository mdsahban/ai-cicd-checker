# Use a small Alpine Linux base image. This keeps our container lightweight and reduces the attack surface.
FROM node:18-alpine

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=3000

# Create the working directory for our app inside the container
WORKDIR /usr/src/app

# By default, Docker runs as 'root'. For security, we give ownership of our directory to 
# the built-in non-root 'node' user.
RUN chown -R node:node /usr/src/app

# Switch to the non-root 'node' user
USER node

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install only production dependencies (this ignores devDependencies like Jest)
RUN npm ci --only=production

# Copy the rest of the application files
COPY --chown=node:node . .

# Let Docker know that the container listens on the specified network port
EXPOSE 3000

# Add a Docker health check. Docker will periodically hit our /health endpoint to ensure the app hasn't crashed.
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]
