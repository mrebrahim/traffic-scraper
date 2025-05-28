const { chromium } = require("playwright");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://lifwzerfuobdppwaowcv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpZnd6ZXJmdW9iZHBwd2Fvd2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTA0NjAsImV4cCI6MjA2MzU4NjQ2MH0.h6hWAkBHdIBV2LITUDWvjGccgIcrpRzuqOv6b1HX8mk"
);

(async () => {
  console.log("🚀 جارٍ تشغيل المتصفح مع البروكسي...");

  let browser;

  try {
    browser = await chromium.launch({
      headless: true,
      proxy: {
        server: 'http://proxy.toolip.io:31114',
        username: '55b3d4be',
        password: 'vygt7axz1hxw',
      },
      args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      ignoreHTTPSErrors: true,
    });

    const page = await context.newPage();

    console.log("🌐 فتح صفحة تسجيل الدخول...");
    await page.goto("https://evg.ae/_layouts/EVG/Login.aspx?language=ar", {
      waitUntil: "networkidle",
      timeout: 90000,
    });

    console.log("📌 الضغط على تبويب المؤسسات...");
    await page.locator('#ctl00_cphScrollMenu_rbtnCompany').check();
    await page.waitForTimeout(3000);

    console.log("⏳ في انتظار ظهور الحقول...");
    await page.waitForSelector('#ctl00_cphScrollMenu_txtCompnayTCF', {
      timeout: 60000,
      state: 'visible',
    });

    console.log("✍️ إدخال بيانات المؤسسة...");
    await page.fill('#ctl00_cphScrollMenu_txtCompnayTCF', '1140163127');
    await page.fill('#ctl00_cphScrollMenu_txtLogin', '1070093478');
    await page.fill('#ctl00_cphScrollMenu_txtPassword', 'Yzaa3vip@');

    console.log("🔐 الضغط على زر تسجيل الدخول...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 90000 }),
      page.click('#ctl00_cphScrollMenu_btnLogin'),
    ]);

    console.log("✅ تم تسجيل الدخول بنجاح!");

    const data = {
      plateNumber: "12345",
      violationCount: 3,
      date: new Date().toISOString(),
    };

    const { error } = await supabase.from("violations").insert([data]);
    if (error) {
      console.error("❌ فشل رفع البيانات لـ Supabase:", error.message);
    } else {
      console.log("✅ تم رفع البيانات إلى Supabase بنجاح.");
    }

  } catch (error) {
    console.error("❌ حصل خطأ:", error.message);

    if (browser) {
      const context = await browser.newContext();
      const page = await context.newPage();

      const screenshotPath = "/tmp/error-screenshot.png";
      await page.screenshot({ path: screenshotPath, fullPage: true });

      const imageBuffer = fs.readFileSync(screenshotPath);

      const { error: uploadError } = await supabase.storage
        .from("screenshots")
        .upload(`errors/${Date.now()}.png`, imageBuffer, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) {
        console.error("⚠️ فشل رفع لقطة الشاشة:", uploadError.message);
      } else {
        console.log("📸 تم رفع لقطة الشاشة لتشخيص المشكلة.");
      }
    }

  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
