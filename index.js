// ... بداية الكود بدون تغيير

const { chromium } = require("playwright");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://your-supabase-project-url.supabase.co",
  "your-anon-or-service-key"
);

(async () => {
  console.log("🚀 جارٍ تشغيل المتصفح مع البروكسي...");

  const browser = await chromium.launch({
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

  try {
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
    await page.fill('#ctl00_cphScrollMenu_txtCompnayTCF', '1140163127'); // رقم الرمز المروري للمؤسسة
    await page.fill('#ctl00_cphScrollMenu_txtLogin', '1070093478');       // الرمز المروري للمندوب
    await page.fill('#ctl00_cphScrollMenu_txtPassword', 'Yzaa3vip@');    // كلمة المرور

    console.log("🔐 الضغط على زر تسجيل الدخول...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 90000 }),
      page.click('#ctl00_cphScrollMenu_btnLogin'),
    ]);

    console.log("✅ تم تسجيل الدخول بنجاح!");

    // ✅ إرسال البيانات إلى Supabase
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

    console.log("📄 جزء من الصفحة:\n", (await page.content()).slice(0, 500));
    console.log("📍 العنوان:", await page.title());
    console.log("🌐 الرابط:", page.url());
  } finally {
    await browser.close();
  }
})();
