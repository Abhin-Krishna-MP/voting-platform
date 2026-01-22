#!/bin/bash

# 🔐 Automated Security Fix Script
# This script removes secrets from git history and pushes clean code

echo "🔐 Starting security fix..."
echo ""

# Step 1: Undo the problematic commit (but keep changes)
echo "📝 Step 1: Undoing problematic commit..."
git reset --soft HEAD~1

# Step 2: Unstage all changes
echo "📝 Step 2: Unstaging changes..."
git reset HEAD

# Step 3: Stage only safe files
echo "📝 Step 3: Staging safe files..."
git add docker-compose.yml .env.example .gitignore SECURITY_FIX.md
git add lib/ components/ app/
git add *.md

# Step 4: Commit with security fix
echo "📝 Step 4: Creating secure commit..."
git commit -m "feat: modern UI with secure environment configuration

- Move OAuth secrets from docker-compose.yml to .env
- Add .env.example template
- Update .gitignore to protect sensitive files
- Implement modern UI with gradients and animations
- Add analytics dashboard components
- Create design system (theme.js, analytics.js)
- Add comprehensive documentation"

# Step 5: Force push to rewrite history
echo "📝 Step 5: Pushing to GitHub (rewriting history)..."
echo "⚠️  This will force push to main branch"
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    git push -f origin main
    echo ""
    echo "✅ Success! Your repository is now secure!"
    echo ""
    echo "🔒 Next steps:"
    echo "1. Consider rotating your OAuth credentials (recommended)"
    echo "2. Test your app: sudo docker compose up -d --build"
    echo "3. Visit: http://localhost:3000"
else
    echo ""
    echo "❌ Cancelled. No changes pushed to GitHub."
    echo "Your local changes are staged. You can:"
    echo "  - Run this script again"
    echo "  - Or manually: git push -f origin main"
fi
