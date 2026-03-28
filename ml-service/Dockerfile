# Use Python 3.11 slim image with Node.js
FROM node:18-slim

# Install Python 3.11 and necessary build tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY requirements.txt ./

# Install Node dependencies
RUN npm install --production

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy application files
COPY . .

# Expose the port
EXPOSE 10000

# Start the server
CMD ["node", "server.js"]
