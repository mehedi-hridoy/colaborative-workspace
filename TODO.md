# Font Contrast Fix Plan
Current working directory: /home/hridoy/Music/collaborative-workspace

## Steps (in order):

### 1. Read login/register pages (confirm content)
- read_file apps/web/app/login/page.js
- read_file apps/web/app/register/page.js

### 2. Edit globals.css for global high-contrast text defaults
- Ensure body { color: #111827 !important; }
- Dark: color: #f9fafb !important;
- h1-h3 stronger.

### 3. Fix landing page.js (/ page)
- Darken secondary texts [#93939f → #374151, #75758a → #4b5563]

### 4. Fix login/register inline styles
- Explicit bg-colors, darker text if needed.
- Add className="glass-input" etc.

### 5. Test: cd apps/web && npm run dev; check / /login /register /dashboard
- Toggle theme, browser inspect contrast.

### 6. Update components if needed (TopBar/Sidebar cards)

### 7. attempt_completion

Progress: 6/7 complete ✓ (All pages fixed, build clean, text highly visible)

