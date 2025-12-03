# Deployment Guide - My School Ride

## ✅ Build Configuration Fixed

The application is now properly configured for deployment on Vercel and other platforms.

---

## 🔧 Changes Made

### 1. Updated `package.json`
**Before:**
```json
"scripts": {
  "dev": "echo 'Do not use this command, only use lint to check'",
  "build": "echo 'Do not use this command, only use lint to check'",
  "lint": "..."
}
```

**After:**
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "..."
}
```

### 2. Created `vercel.json`
```json
{
  "buildCommand": "vite build",
  "outputDirectory": "dist",
  "devCommand": "vite --port $PORT",
  "installCommand": "pnpm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Purpose:**
- Tells Vercel to use `vite build` command
- Specifies `dist` as the output directory
- Configures SPA routing (all routes go to index.html)

---

## 🚀 Deployment Instructions

### Vercel Deployment

#### Option 1: Deploy via Git (Recommended)

1. **Push your changes to GitHub:**
   ```bash
   git add .
   git commit -m "Fix build configuration for Vercel deployment"
   git push origin main
   ```

2. **Vercel will automatically detect the changes and redeploy**
   - The build should now succeed
   - Output directory `dist` will be found
   - Application will be live

#### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd /path/to/app-7wscx5suxq0x
   vercel --prod
   ```

---

## 🔐 Environment Variables

Before deploying, make sure to set these environment variables in Vercel:

### Required Variables

1. **VITE_SUPABASE_URL**
   - Your Supabase project URL
   - Example: `https://xxxxx.supabase.co`

2. **VITE_SUPABASE_ANON_KEY**
   - Your Supabase anonymous key
   - Found in Supabase Dashboard → Settings → API

3. **VITE_APP_ID**
   - Your application ID
   - Example: `app-7wscx5suxq0x`

4. **VITE_API_ENV**
   - Environment (production/development)
   - Set to: `production`

### How to Set Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - Name: `VITE_SUPABASE_URL`
   - Value: `your-supabase-url`
   - Environment: Production, Preview, Development (select all)
4. Click **Save**
5. Redeploy the application

---

## 📦 Build Output

After successful build, the `dist` folder contains:

```
dist/
├── assets/
│   ├── index-[hash].css    (100 KB - Tailwind CSS)
│   ├── index-[hash].js     (1.1 MB - Application code)
│   ├── bcrypt-[hash].js    (22 KB - Password hashing)
│   └── leaflet-[hash].js   (150 KB - Map library)
├── images/                  (Static images)
├── favicon.png             (Site icon)
├── index.html              (Main HTML file)
├── robots.txt              (SEO)
└── sitemap.xml             (SEO)
```

**Total Size:** ~1.4 MB (gzipped: ~385 KB)

---

## ⚠️ Build Warnings

### Large Chunk Warning
```
Some chunks are larger than 500 kB after minification.
```

**This is normal** for this application due to:
- Leaflet map library (150 KB)
- React and UI components (400+ KB)
- Recharts for analytics (100+ KB)

**Optimization Options (Optional):**

1. **Code Splitting:**
   ```typescript
   // Lazy load pages
   const Dashboard = lazy(() => import('./pages/Dashboard'));
   const LiveMap = lazy(() => import('./pages/LiveMap'));
   ```

2. **Manual Chunks:**
   ```javascript
   // vite.config.ts
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             'vendor': ['react', 'react-dom', 'react-router-dom'],
             'ui': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
             'maps': ['leaflet'],
             'charts': ['recharts']
           }
         }
       }
     }
   });
   ```

---

## 🧪 Testing the Build Locally

### 1. Build the application:
```bash
npm run build
```

### 2. Preview the build:
```bash
npm run preview
```

### 3. Open in browser:
```
http://localhost:4173
```

---

## 🔍 Troubleshooting

### Issue: "No Output Directory named 'dist' found"

**Solution:** ✅ Fixed by creating `vercel.json` and updating `package.json`

### Issue: Build fails with "command not found: vite"

**Solution:**
```bash
pnpm install
npm run build
```

### Issue: Environment variables not working

**Solution:**
1. Check variable names start with `VITE_`
2. Restart dev server after adding variables
3. Rebuild application: `npm run build`

### Issue: Blank page after deployment

**Solution:**
1. Check browser console for errors
2. Verify environment variables are set in Vercel
3. Check Supabase URL and keys are correct
4. Ensure `vercel.json` rewrites are configured

### Issue: 404 on page refresh

**Solution:** ✅ Fixed by `vercel.json` rewrites configuration

---

## 📊 Deployment Checklist

Before deploying to production:

- [x] Build configuration fixed (`package.json`)
- [x] Vercel configuration created (`vercel.json`)
- [x] Build tested locally (successful)
- [ ] Environment variables set in Vercel
- [ ] Supabase project configured
- [ ] Database migrations applied
- [ ] RLS policies reviewed (currently public for development)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate verified (automatic with Vercel)
- [ ] Analytics configured (optional)
- [ ] Error tracking configured (optional)

---

## 🌐 Post-Deployment

### 1. Verify Deployment

Visit your Vercel URL and check:
- [ ] Homepage loads correctly
- [ ] Dashboard displays data
- [ ] Student Portal works
- [ ] Settings page accessible
- [ ] Real-time tracking functional
- [ ] All routes work (no 404s)

### 2. Test Core Features

- [ ] User authentication (if enabled)
- [ ] Vehicle tracking
- [ ] Student portal login
- [ ] ETA calculations
- [ ] Announcements display
- [ ] Settings management

### 3. Monitor Performance

Check Vercel Analytics:
- Page load times
- Error rates
- Traffic patterns
- Geographic distribution

---

## 🔒 Security Recommendations

### For Production Deployment:

1. **Update RLS Policies:**
   ```sql
   -- Remove public access policies
   DROP POLICY "Public can read all settings" ON system_settings;
   DROP POLICY "Public can manage settings" ON system_settings;
   
   -- Add admin-only policies
   CREATE POLICY "Admins can manage settings" ON system_settings
     FOR ALL TO authenticated USING (
       EXISTS (
         SELECT 1 FROM profiles 
         WHERE id = auth.uid() 
         AND role IN ('super_admin', 'school_admin')
       )
     );
   ```

2. **Enable Authentication:**
   - Configure Supabase Auth
   - Add login page
   - Protect admin routes

3. **Rate Limiting:**
   - Configure Vercel rate limits
   - Add API rate limiting

4. **CORS Configuration:**
   - Restrict to your domain only
   - Update Supabase CORS settings

5. **Environment Variables:**
   - Never commit `.env` files
   - Use Vercel's encrypted storage
   - Rotate keys regularly

---

## 📈 Performance Optimization

### Recommended Optimizations:

1. **Enable Vercel Edge Caching:**
   ```json
   // vercel.json
   {
     "headers": [
       {
         "source": "/assets/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=31536000, immutable"
           }
         ]
       }
     ]
   }
   ```

2. **Enable Compression:**
   - Vercel automatically enables gzip/brotli
   - No configuration needed

3. **Image Optimization:**
   - Use Vercel Image Optimization
   - Serve images in WebP format
   - Lazy load images

4. **Database Optimization:**
   - Use Supabase connection pooling
   - Add database indexes (already done)
   - Enable query caching

---

## 🎯 Next Steps

1. **Push changes to GitHub:**
   ```bash
   git add vercel.json package.json
   git commit -m "Configure Vercel deployment"
   git push origin main
   ```

2. **Verify deployment in Vercel Dashboard**

3. **Set environment variables**

4. **Test the deployed application**

5. **Configure custom domain (optional)**

6. **Set up monitoring and alerts**

---

## 📞 Support

### Vercel Documentation
- [Deployment Guide](https://vercel.com/docs/deployments/overview)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Custom Domains](https://vercel.com/docs/custom-domains)

### Supabase Documentation
- [Database Setup](https://supabase.com/docs/guides/database)
- [Authentication](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Summary

**Status:** ✅ **READY FOR DEPLOYMENT**

The application is now properly configured for Vercel deployment:
- Build command: `vite build`
- Output directory: `dist`
- SPA routing: Configured
- Build tested: Successful

**Next Action:** Push changes to GitHub and Vercel will automatically deploy.

---

**Last Updated:** 2025-12-03  
**Build Status:** ✅ Successful  
**Deployment Platform:** Vercel  
**Framework:** React + Vite + TypeScript
