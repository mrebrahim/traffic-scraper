const { execSync } = require("child_process");
const { chromium } = require("playwright");
const { createClient } = require("@supabase/supabase-js");

// ✅ تثبيت Chromium في بيئة Render
try {
  execSync("npx playwright install chromium", { stdio: "inherit" });
} catch (e) {
  console.error("❌ فشل تثبيت Chromium:", e);
  process.exit(1);
}

// ✅ إعداد Supabase
const supabaseUrl = "https://lifwzerfuobdppwaowcv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // 🔐 قصّرت المفتاح لحمايتك
const supabase = createClient(supabaseUrl, supabaseKey);

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
    await page.click('label[for="ctl00_cphScrollMenu_rbtnCompany"]');

    console.log("⏳ في انتظار الحقول...");
    await page.waitForSelector('input[name="ctl00$PlaceHolderMain$tc$tcInstitution$txtCompanyTCN"]', {
      timeout: 90000,
      state: 'visible',
    });

    console.log("✍️ إدخال بيانات الشركة والمندوب...");
    await page.fill('input[name="ctl00$PlaceHolderMain$tc$tcInstitution$txtCompanyTCN"]', '1140163127');
    await page.fill('input[name="ctl00$PlaceHolderMain$tc$tcInstitution$txtDelegateTCN"]', '1070093478');
    await page.fill('input[name="ctl00$PlaceHolderMain$tc$tcInstitution$txtPassword"]', 'Yzaa3vip@');

    console.log("🔐 تسجيل الدخول...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 90000 }),
      page.click('input[name="ctl00$PlaceHolderMain$tc$tcInstitution$btnInstitutionLogin"]'),
    ]);

    console.log("✅ تم تسجيل الدخول بنجاح!");

    // ✅ إدخال البيانات في Supabase بعد تسجيل الدخول
    const data = {
      plateNumber: "12345", // ← غيّرها حسب المطلوب
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

    // 👀 طباعة جزء من الصفحة للمساعدة في التشخيص
    const html = await page.content();
    console.log("📄 جزء من الصفحة:\n", html.slice(0, 500));
  } finally {
    await browser.close();
  }
})();
