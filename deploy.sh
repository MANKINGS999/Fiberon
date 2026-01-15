#!/bin/bash
# Quick Deployment Setup Script for Fiberon

echo "🚀 Fiberon Deployment Setup"
echo "=================================="
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Installing..."
    npm install -g pnpm
fi

echo "✅ Installing dependencies..."
pnpm install

echo ""
echo "📦 Deploying Convex backend to production..."
echo "This will:"
echo "  1. Deploy your backend functions"
echo "  2. Show you the deployment URL"
echo "  3. You'll need to copy that URL and add it to Vercel/Netlify"
echo ""

npx convex deploy --prod

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the Convex deployment URL shown above"
echo "2. Go to Vercel/Netlify dashboard"
echo "3. Add environment variable: VITE_CONVEX_URL = <paste-url>"
echo "4. Redeploy the frontend"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
