# Task: Fix Create Workspace Button, Update README, Git Push

## Plan Steps
- [x] Create this TODO.md file ✅
- [x] Implement Create Workspace Modal in apps/web/app/dashboard/page.js ✅
  - Add JSX modal triggered by showCreateWs
  - Move form states/inputs/logic to modal (reuse handleCreateWorkspace)
  - Style as glass-card, responsive
- [x] Fix dashboard no-workspace button: remove disabled/opacity if inappropriate ✅
- [x] Update README.md ✅
  - Add 🆕 Fix section
  - Add troubleshooting for API/backend
- [ ] Test:
  - Backend running? `cd apps/api && npm run dev`
  - Frontend: `npm run dev`
  - Login → no ws → click Create → modal → create → sidebar updates
- [ ] Git commit: `git add . && git commit -m "Fix: Create workspace button/modal + README update"`
- [ ] Git push
- [ ] Update TODO.md with completions ✅

**Notes:** Preserve all existing functionality (sidebar +, details form remains as advanced option).

