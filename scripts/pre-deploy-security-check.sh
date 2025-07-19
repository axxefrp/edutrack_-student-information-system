#!/bin/bash

# 🇱🇷 EduTrack Liberian SIS - Pre-Deployment Security Check
# This script ensures no sensitive files are included in the deployment

echo "🔒 Running pre-deployment security check for EduTrack Liberian SIS..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Security check results
SECURITY_ISSUES=0

echo -e "${BLUE}🇱🇷 Checking for sensitive files...${NC}"

# Check for sensitive files that should not be in the repository
SENSITIVE_FILES=(
    "serviceAccountKey.json"
    "firebase-adminsdk-*.json"
    ".env.local"
    ".env.development"
    "config/secrets.json"
    "*.key"
    "*.pem"
    "*.p12"
    "*.pfx"
)

for pattern in "${SENSITIVE_FILES[@]}"; do
    if find . -name "$pattern" -not -path "./node_modules/*" -not -path "./.git/*" | grep -q .; then
        echo -e "${RED}❌ Found sensitive file(s): $pattern${NC}"
        find . -name "$pattern" -not -path "./node_modules/*" -not -path "./.git/*"
        SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
    fi
done

# Check for hardcoded secrets in source files
echo -e "${BLUE}🔍 Checking for hardcoded secrets...${NC}"

SECRET_PATTERNS=(
    "AIzaSy[A-Za-z0-9_-]{33}"  # Google API keys
    "sk-[A-Za-z0-9]{48}"       # OpenAI API keys
    "xoxb-[0-9]{11}-[0-9]{11}-[A-Za-z0-9]{24}"  # Slack tokens
    "ghp_[A-Za-z0-9]{36}"      # GitHub personal access tokens
)

for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -r -E "$pattern" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.git . | grep -v "# Example:" | grep -q .; then
        echo -e "${RED}❌ Found potential hardcoded secret matching pattern: $pattern${NC}"
        grep -r -E "$pattern" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.git . | grep -v "# Example:"
        SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
    fi
done

# Check for TODO/FIXME comments that might indicate security issues
echo -e "${BLUE}🚧 Checking for security-related TODOs...${NC}"

if grep -r -i "TODO.*security\|FIXME.*security\|TODO.*password\|FIXME.*password\|TODO.*secret\|FIXME.*secret" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.git . | grep -q .; then
    echo -e "${YELLOW}⚠️ Found security-related TODOs/FIXMEs:${NC}"
    grep -r -i "TODO.*security\|FIXME.*security\|TODO.*password\|FIXME.*password\|TODO.*secret\|FIXME.*secret" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.git .
fi

# Verify required files exist
echo -e "${BLUE}📋 Verifying required deployment files...${NC}"

REQUIRED_FILES=(
    ".github/workflows/deploy.yml"
    "vite.config.ts"
    ".env.production"
    "public/404.html"
    "package.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo -e "${RED}❌ Missing required file: $file${NC}"
        SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
    else
        echo -e "${GREEN}✅ Found: $file${NC}"
    fi
done

# Verify Liberian cultural components exist
echo -e "${BLUE}🇱🇷 Verifying Liberian cultural components...${NC}"

CULTURAL_FILES=(
    "styles/liberianDesignSystem.css"
    "components/Shared/LiberianDesignSystem.tsx"
    "utils/liberianCalendarSystem.ts"
    "utils/liberianGradingSystem.ts"
)

for file in "${CULTURAL_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo -e "${YELLOW}⚠️ Missing cultural file: $file${NC}"
    else
        echo -e "${GREEN}✅ Cultural component found: $file${NC}"
    fi
done

# Check .gitignore configuration
echo -e "${BLUE}📝 Verifying .gitignore configuration...${NC}"

if [[ -f ".gitignore" ]]; then
    # Check if sensitive patterns are in .gitignore
    GITIGNORE_PATTERNS=(
        "*.key"
        "*.pem"
        ".env.local"
        "serviceAccountKey.json"
        "firebase-adminsdk-*.json"
    )
    
    for pattern in "${GITIGNORE_PATTERNS[@]}"; do
        if grep -q "$pattern" .gitignore; then
            echo -e "${GREEN}✅ .gitignore includes: $pattern${NC}"
        else
            echo -e "${YELLOW}⚠️ .gitignore missing pattern: $pattern${NC}"
        fi
    done
else
    echo -e "${RED}❌ .gitignore file not found${NC}"
    SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
fi

# Final security assessment
echo -e "\n${BLUE}🔒 Security Check Summary${NC}"
echo "=================================="

if [[ $SECURITY_ISSUES -eq 0 ]]; then
    echo -e "${GREEN}✅ Security check passed! No issues found.${NC}"
    echo -e "${GREEN}🇱🇷 EduTrack Liberian SIS is ready for secure deployment.${NC}"
    exit 0
else
    echo -e "${RED}❌ Security check failed! Found $SECURITY_ISSUES issue(s).${NC}"
    echo -e "${RED}🚫 Please resolve security issues before deployment.${NC}"
    exit 1
fi
