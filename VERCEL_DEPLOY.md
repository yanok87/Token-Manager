# Deploying to Vercel

This guide explains how to deploy the Token Manager application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. Your WalletConnect Project ID

## Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push to Git Repository

Make sure your code is pushed to a Git repository:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Vercel will auto-detect Next.js

### Step 3: Configure Project Settings

**Root Directory:**
- If your Next.js app is in a subdirectory (like `frontend-blockchain-challenge`), set:
  - **Root Directory:** `frontend-blockchain-challenge`
  - Click **"Edit"** next to Root Directory and select the folder

**Build Settings:**
- **Framework Preset:** Next.js (auto-detected)
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

### Step 4: Add Environment Variables

In the **Environment Variables** section, add:

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

**Important:** 
- Make sure to add this for **Production**, **Preview**, and **Development** environments
- Replace `your-walletconnect-project-id` with your actual WalletConnect Project ID from [Reown Cloud](https://cloud.reown.com/)

### Step 5: Deploy

Click **"Deploy"** and wait for the build to complete.

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Navigate to Project Directory

```bash
cd frontend-blockchain-challenge
```

### Step 4: Deploy

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (select your account)
- Link to existing project? **No** (for first deployment)
- What's your project's name? (enter a name or press Enter for default)
- In which directory is your code located? **./** (current directory)

### Step 5: Add Environment Variables

```bash
vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
```

Enter your WalletConnect Project ID when prompted.

### Step 6: Deploy to Production

```bash
vercel --prod
```

## Environment Variables

The following environment variable is required:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Project ID for mobile wallet connections | Yes |

## Post-Deployment

After deployment:

1. **Test the deployment:**
   - Visit your Vercel URL
   - Connect your wallet
   - Test minting, approving, and transferring tokens

2. **Set up custom domain (optional):**
   - Go to Project Settings → Domains
   - Add your custom domain

3. **Monitor deployments:**
   - Check the Vercel dashboard for build logs
   - Set up deployment notifications if needed

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18.x by default)

### Environment Variables Not Working

- Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding environment variables
- Check that variables are set for the correct environment (Production/Preview/Development)

### Wallet Connection Issues

- Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set correctly
- Check browser console for errors
- Ensure you're on the correct network (Sepolia testnet)

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables on Vercel](https://vercel.com/docs/environment-variables)

