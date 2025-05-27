const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lifwzerfuobdppwaowcv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpZnd6ZXJmdW9iZHBwd2Fvd2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTA0NjAsImV4cCI6MjA2MzU4NjQ2MH0.h6hWAkBHdIBV2LITUDWvjGccgIcrpRzuqOv6b1HX8mk';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
  const browser = await chromium.launch({
    headless: true,
    proxy: {
      server: 'http://proxy.toolip.io:31114',
      username: '55b3d4be',
      password: 'vygt7axz1hxw'
    }
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://evg.ae/_layouts/EVG/Login.aspx?language=ar');
  await page.click('text=دخول الشركات');

  await page.fill('input[name="ctl00$PlaceHolderMain$CompanyTrafficFileNo"]', '1140163127');
  await page.fill('input[name="ctl00$PlaceHolderMain$DelegateTrafficFileNo"]', '1070093478');
  await page.fill('input[name="ctl00$PlaceHolderMain$Password"]', 'Yzaa3vip@');
  await page.click('input[name="ctl00$PlaceHolderMain$btnLogin"]');

  await page.waitForTimeout(5000);

  // مثال لحفظ البيانات في Supabase (تعديل حسب شكل البيانات)
  await supabase.from('violations').insert([
    { plate: '12345', amount: 500, date: '2024-05-01' }
  ]);

  console.log('تم الدخول وتخزين البيانات بنجاح');
  await browser.close();
})();