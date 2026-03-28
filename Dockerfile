FROM node:18-alpine

# Install Python and pip
RUN apk add --no-cache python3 py3-pip

WORKDIR /app

# Copy files
COPY package.json package-lock.json ./
COPY ml-service ./ml-service

# Install Node dependencies
RUN npm install --production

# Install Python dependencies
RUN pip3 install --no-cache-dir -r ml-service/requirements.txt

# Set environment
ENV NODE_ENV=production
ENV PORT=10000

# Start services
CMD ["node", "ml-service/server.js"]
