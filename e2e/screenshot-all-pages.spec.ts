const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Screenshot all pages', () => {
  // Define static routes to screenshot (excluding dynamic routes with parameters)
  const routes = [
    { path: '/', name: 'home' },
    { path: '/auth/login', name: 'login' },
    { path: '/auth/register', name: 'register' },
    { path: '/dashboard', name: 'dashboard' },
    { path: '/applications', name: 'applications' },
    { path: '/smart-application', name: 'smart-application' },
    { path: '/profile', name: 'profile' },
    { path: '/jd-analysis', name: 'jd-analyzer' },
    { path: '/resume-strategy', name: 'resume-strategy' },
    { path: '/resume-editor', name: 'resume-editor' },
    { path: '/export', name: 'export' },
    { path: '/interview', name: 'interview' },
    { path: '/analytics', name: 'analytics' },
    { path: '/insights', name: 'insights' },
    { path: '/settings', name: 'settings' },
    { path: '/community/feed', name: 'community-feed' },
    { path: '/community/opportunities', name: 'community-opportunities' },
    { path: '/community/opportunities/new', name: 'community-create-opportunity' },
    { path: '/community/discussions', name: 'community-discussions' },
    { path: '/community/discussions/new', name: 'community-create-discussion' },
    { path: '/community/referrals', name: 'community-referrals' },
    { path: '/community/referrals/request', name: 'community-request-referral' },
    { path: '/community/notifications', name: 'community-notifications' },
    { path: '/community/templates', name: 'community-templates' },
    { path: '/admin/learning', name: 'admin-learning' }
  ];

  // Create screenshots directory
  const screenshotsDir = path.join('/home/adeel/Documents/serious projects/working on projects/job automator', 'images');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  routes.forEach(route => {
    test(`screenshot ${route.name} page`, async ({ page }) => {
      await page.goto('http://localhost:5173' + route.path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // Wait for any animations
      
      const screenshotPath = path.join(screenshotsDir, `${route.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved: ${screenshotPath}`);
    });
  });
});