# afixcrypto Frontend

Next.js 16 application for the [afixcrypto](https://github.com/Mogusu2/BTC_Backend) binary BTC options trading platform.

## Features

- **Public site**: landing, about, help, legal pages
- **Auth flows**: signup, login with mandatory email OTP, password reset
- **User dashboard**: live BTC price chart, signal panel, bet placement, trade history, wallet
- **Admin portal**: user management, bet/signal monitoring, withdrawal approvals, treasury
- **Super admin portal**: platform settings, kill switches, admin management, audit log
- **Real-time data**: Binance WebSocket for live BTC prices
- **Auto-refresh tokens**: silent JWT refresh, never get logged out unexpectedly
- **Inactivity logout**: auto-logout after 15 minutes idle for security

## Tech Stack

- **Framework**: Next.js 16 (Turbopack, App Router)
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS
- **State**: Zustand (client), TanStack Query (server)
- **HTTP**: Axios with refresh-token interceptor
- **Charts**: lightweight-charts (TradingView)
- **WebSocket**: Socket.IO client + Binance WebSocket
- **Icons**: Heroicons
- **Monitoring**: @sentry/nextjs

## Prerequisites

- Node.js 20+ and pnpm 8+
- Running [afixcrypto backend](https://github.com/Mogusu2/BTC_Backend) (locally or deployed)

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/Mogusu2/btc_front.git
cd btc_front
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment

Copy the example and fill in:

```bash
cp .env.example .env.local
```

### 4. Start the dev server

```bash
pnpm dev
```

App runs on `http://localhost:3000`.

## Environment Variables

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# WebSocket URL (typically same as API)
NEXT_PUBLIC_WS_URL=http://localhost:3001

# Public site URL (for SEO/OG tags)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Sentry (optional in dev, required in prod)
NEXT_PUBLIC_SENTRY_DSN=
```

For production, set these in your hosting platform (Vercel → Settings → Environment Variables):

```env
NEXT_PUBLIC_API_URL=https://api.afixcrypto.com
NEXT_PUBLIC_WS_URL=https://api.afixcrypto.com
NEXT_PUBLIC_SITE_URL=https://afixcrypto.com
NEXT_PUBLIC_SENTRY_DSN=<production-dsn>
```

## Running

### Development
```bash
pnpm dev          # Turbopack dev server
```

### Production build
```bash
pnpm build        # Build optimized production bundle
pnpm start        # Start production server
```

### Lint
```bash
pnpm lint         # Run ESLint
```

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── (public pages: landing, about, etc.)
│   ├── auth/
│   │   ├── login/                # Login flow with OTP step
│   │   ├── register/             # Signup with email verification
│   │   └── forgot-password/      # Password reset flow
│   ├── dashboard/                # User-facing app
│   │   ├── page.tsx              # Main dashboard
│   │   ├── trade/                # Trading interface
│   │   ├── history/              # Trade history
│   │   ├── wallet/               # Deposits + withdrawals
│   │   ├── profile/              # Account info
│   │   └── security/             # Password, 2FA
│   ├── admin/                    # Admin portal
│   │   ├── page.tsx              # Role-aware dashboard
│   │   ├── users/                # User management
│   │   │   └── [userId]/         # User detail (balance, role)
│   │   ├── bets/                 # All bets
│   │   ├── signals/              # Signal management
│   │   ├── treasury/             # Platform funds
│   │   ├── withdrawals/          # Approval queue
│   │   ├── deposits/             # Deposit log
│   │   ├── settings/             # ⚡ Super admin only
│   │   ├── admins/               # ⚡ Super admin only
│   │   └── audit-log/            # ⚡ Super admin only
│   └── layout.tsx                # Root layout with metadata, favicons
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── ThemeToggle.tsx
│   │   └── ...
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── PasswordStrengthMeter.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── DashboardLayout.tsx   # User dashboard chrome
│   │   ├── AdminLayout.tsx       # Admin portal chrome
│   │   ├── PublicLayout.tsx
│   │   ├── LayoutWrapper.tsx
│   │   └── Footer.tsx
│   ├── trading/                  # Bet form, chart, signals
│   └── Logo.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts             # Axios instance with interceptors
│   │   ├── auth.api.ts
│   │   ├── user.api.ts
│   │   ├── bets.api.ts
│   │   ├── wallet.api.ts
│   │   └── admin.api.ts
│   └── utils/
│       └── admin.ts              # isAdmin, isSuperAdmin, getCurrentUser
├── hooks/
│   ├── useAutoLogout.ts          # 15-min inactivity logout
│   └── ...
└── store/                        # Zustand stores
```

## Auth Flow Walkthrough

The frontend implements the multi-step login designed to match the backend:

1. **User submits email + password** at `/auth/login`
2. Backend responds with `{ requiresOtp: true, email: "..." }` — no token yet
3. UI shows OTP entry screen
4. User enters 6-digit code from email
5. Frontend calls `/user/verify-login-otp`
6. Backend returns `{ token, refreshToken, ...userInfo }`
7. Frontend:
   - Stores `token` in localStorage
   - Stores user object in localStorage
   - Sets `auth_token` cookie (for middleware route protection)
   - Refresh token is set as httpOnly cookie by the server (not accessible to JS)
8. Redirects based on role:
   - `user` → `/dashboard`
   - `admin` or `super_admin` → `/admin`

### Token refresh

When any API call returns 401:
1. Axios interceptor detects it
2. Calls `POST /user/refresh` (cookie auto-sent)
3. Receives new access token
4. Retries the original request with new token
5. User never sees the refresh

If refresh itself fails (refresh token expired/revoked), user is redirected to `/auth/login?expired=true`.

### Inactivity logout

`useAutoLogout` hook in `DashboardLayout` and `AdminLayout`:
- Tracks user activity (mouse, keyboard, touch)
- Resets a 15-minute timer
- On expiry: clears tokens and redirects to login

## Customization

### Branding
- Logo: `public/afixcrypto.png` (use full Canva-exported wordmark)
- Favicon set: `public/favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, etc. (transparent icon only)
- Colors: Tailwind config in `tailwind.config.ts` — `binance-yellow: #f0b90b`, etc.

### Theming
The app supports dark theme by default. Theme is managed via Tailwind's CSS variables (`bg-primary`, `text-primary`, etc.) — to change colors, edit `src/app/globals.css` and `tailwind.config.ts`.

### Adding a new page
1. Create the page file in the appropriate directory (App Router conventions)
2. If it's protected, ensure it's under `/dashboard` or `/admin` — those have layouts that check auth
3. If it's public, add it to the `PUBLIC_PAGES` list in `LayoutWrapper.tsx` if needed

### Adding admin endpoints
1. Add the endpoint to the backend
2. Add a method to `src/lib/api/admin.api.ts`:
   ```typescript
   newAction: (data: any) => api.post('/admin/new-action', data),
   ```
3. Use it with TanStack Query:
   ```typescript
   const mutation = useMutation({
     mutationFn: (data) => adminApi.newAction(data),
     onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-stats'] }),
   });
   ```

## Deployment

### Vercel (Recommended)

1. Sign up at [vercel.com](https://vercel.com) with GitHub
2. Import this repo
3. Vercel auto-detects Next.js, no config needed
4. Add environment variables in Settings → Environment Variables
5. Click Deploy

Every push to `main` triggers a production deploy. Every push to other branches creates a preview deployment.

### Configure custom domain

1. Vercel → Settings → Domains → Add your domain
2. Vercel shows you DNS records to add
3. In Cloudflare (or your DNS provider):
   - `A` record for root → Vercel IP
   - `CNAME` for `www` → `cname.vercel-dns.com`

### Production checklist

- [ ] `NEXT_PUBLIC_API_URL` points to production backend
- [ ] `NEXT_PUBLIC_SENTRY_DSN` configured
- [ ] Favicons load correctly in all browsers (hard refresh to clear cache)
- [ ] Test signup → login → dashboard flow end-to-end on the deployed URL
- [ ] Test on mobile devices
- [ ] Verify HTTPS is enforced
- [ ] Check Sentry receives test errors

## Troubleshooting

### `Cannot find name 'authApi'`
Missing import. Add to the file:
```typescript
import { authApi } from '@/lib/api/auth.api';
```

### `Type X is not assignable to type 'IntrinsicAttributes & LogoProps'`
You're passing a prop the Logo component doesn't accept. Either remove the prop or add it to `LogoProps` in `src/components/Logo.tsx`.

### Favicon not updating
Browsers cache favicons aggressively. Workarounds:
- Hard refresh: `Ctrl+Shift+R`
- Add cache-bust to icons in `layout.tsx`: `/favicon.ico?v=2`
- Clear site data in DevTools → Application → Storage

### `themeColor configured in metadata` warning
Next.js 16 moved `themeColor` to a separate `viewport` export. In `src/app/layout.tsx`:
```typescript
export const viewport: Viewport = {
  themeColor: '#0b0e11',
  width: 'device-width',
  initialScale: 1,
};
```

### Rate limit errors (429) on admin pages
The backend's rate limiter is too strict for admin endpoints. Fix by adding `@SkipThrottle()` to `AdminController` in the backend.

### `[API] Cooling down from rate limit`
This is the frontend's circuit breaker pausing requests after a 429 from the backend. It clears after 60 seconds. To clear immediately: hard-refresh the page.

### Auto-logout firing too quickly
Adjust the timeout in `src/hooks/useAutoLogout.ts`:
```typescript
const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes
```

### Tokens not refreshing automatically
Check that:
1. Backend CORS has `credentials: true`
2. Axios client has `withCredentials: true`
3. Browser allows third-party cookies for your domain (if frontend and backend are on different domains)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome Mobile

## License

Proprietary. All rights reserved.
