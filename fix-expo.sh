#!/bin/bash
# Script to fix Metro bundler issues in Expo projects

echo "Stopping any running Expo processes..."
pkill -f "expo|metro"

echo "Clearing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

echo "Clearing npm cache..."
npm cache clean --force

echo "Installing latest @expo/cli..."
npm install @expo/cli@latest

echo "Reinstalling project dependencies..."
npm install

echo "Starting Expo project..."
npm start