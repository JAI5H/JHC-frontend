#!/bin/bash

# Exit on first error
set -e

echo "Installing dependencies..."
npm install

echo "Building the project..."
npm run build

echo "Deploying to Google Cloud App Engine (Project: jhc-dev)..."
gcloud app deploy app.yaml --project=jhc-dev --quiet

echo "Deployment finished!"
