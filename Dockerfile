# Stage 1: Build the application
FROM node:22 as base

FROM base as deps
COPY --chmod=0644 certs/*.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates
WORKDIR /app

COPY package*.json ./
RUN npm ci


FROM base AS build
COPY --chmod=0644 certs/*.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates
# Set the working directory
WORKDIR /app
#COPY --from=deps /app/fidium-ui-toolkit-*.tgz ./
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the application code
COPY . .


# Build the application
RUN npm run build

# Stage 2: Run the application
FROM base as runner
COPY --chmod=0644 certs/*.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates
RUN apt-get update && apt-get install -y awscli
# Set the working directory
WORKDIR /app

# Copy only the production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the built application from the build stage
COPY --from=build /app/dist ./dist

# Copy the .env file
COPY .env ./

# Add a user to run the application
RUN useradd --user-group --create-home --shell /bin/false appuser

# Change ownership of the application files
RUN chown -R appuser:appuser /app

# Switch to the new user
USER appuser

# Add a health check
# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s CMD curl -f http://localhost:3000/health || exit 1

# Command to run the application
CMD ["npm", "run", "start"]
