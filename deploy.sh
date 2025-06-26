#!/bin/bash

# Korean Education Platform Deployment Script
echo "Building Korean Education Platform for deployment..."

# Build the frontend
echo "Building frontend..."
npm run build

# Copy built files to server public directory
echo "Copying built files to server directory..."
mkdir -p server/public
cp -r dist/public/* server/public/

echo "Deployment files prepared successfully!"
echo "Built files are now in server/public/"
echo "You can now deploy using the Replit deploy button."