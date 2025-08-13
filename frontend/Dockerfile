## Nginx server for the Vite app

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps with cached layers
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy the rest of the app
COPY . .

# Build-time env (Vite reads VITE_* at build)
ARG VITE_COMING_SOON=$VITE_COMING_SOON
ARG VITE_CONTACT_EMAIL=$VITE_CONTACT_EMAIL
ENV VITE_COMING_SOON=$VITE_COMING_SOON
ENV VITE_CONTACT_EMAIL=$VITE_CONTACT_EMAIL

# Build static assets
RUN npm run build

# 2) Runtime stage
FROM nginx:alpine AS runtime

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA routing + caching
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

