# QR Code Fix & Deployment TODO

## Completed Steps
- ✅ Diagnosed issue: localhost URLs in QR codes inaccessible from phone  
- ✅ Updated qrcode.service.js - public URL support  
- ✅ Fixed App.js route - QRCheckIn page active  
- ✅ Created .env.example template

## Pending Steps
1. □ Update `src/services/qrcode.service.js` - use REACT_APP_PUBLIC_URL env var
2. □ Check/add route `/qr-checkin/:orgId/:serviceId` in `src/App.js` 
3. □ Create `.env` with Vercel domain (after deploy)
4. □ `git add . && git commit -m "fix: QR public URL support"`
5. □ Push to GitHub: `git push origin main`
6. □ Deploy to Vercel (FREE):
     ```
     npm i -g vercel
     vercel --prod
     ```
7. □ Update .env: REACT_APP_PUBLIC_URL=https://your-app.vercel.app
8. □ `vercel deploy` & test QR scan from phone
9. □ Update TODO.md: Mark all ✅

**Run locally with ngrok for testing** (temporary):
```
npm install -g ngrok
ngrok http 3000
# Copy https://*.ngrok-free.app to .env
npm start
```

