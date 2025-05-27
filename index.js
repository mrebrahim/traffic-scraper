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
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpZnd6ZXJmdW9iZHBwd2Fvd2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTA0NjAsImV4cCI6MjA2MzU4NjQ2MH0.h6hWAkBHdIBV2LITUDWvjGccgIcrpRzuqOv6b1HX8mk";
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log("🚀 جارٍ تشغيل المتصفح...");

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  try {
    console.log("🌐 فتح صفحة تسجيل الدخول...");

    await page.goto("https://evg.ae/_layouts/EVG/Login.aspx?language=ar", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    console.log("📌 الضغط على زر المؤسسات...");
    await page.click('button:has-text("المؤسسات")');

    // ملء بيانات تسجيل الدخول للمؤسسات
    console.log("✍️ إدخال بيانات الشركة والمندوب...");
    await page.fill('input[name="ctl00$PlaceHolderMain$tc$tcInstitution$txtCompanyTCN"]', '1140163127');
    await page.fill('input[name="ctl00$PlaceHolderMain$tc$tcInstitution$txtDelegateTCN"]', '1070093478');
    await page.fill('input[name="ctl00$PlaceHolderMain$tc$tcInstitution$txtPassword"]', 'Yzaa3vip@');

    // الضغط على زر الدخول
    console.log("🔐 تسجيل الدخول...");
    await page.click('input[name="ctl00$PlaceHolderMain$tc$tcInstitution$btnInstitutionLogin"]');

    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 });

    console.log("✅ تم تسجيل الدخول بنجاح!");

    // ✅ هنا تبدأ تسحب البيانات بعد الدخول
    const data = {
      plateNumber: "12345", // ← عدلها لما تحدد البيانات الحقيقية
      violationCount: 3,
      date: new Date().toISOString(),
    };

    // رفع البيانات إلى Supabase
    const { error } = await supabase.from("violations").insert([data]);

    if (error) {
      console.error("❌ فشل رفع البيانات لـ Supabase:", error.message);
    } else {
      console.log("✅ تم رفع البيانات بنجاح.");
    }

  } catch (error) {
    console.error("❌ حصل خطأ:", error.message);
  } finally {
    await browser.close();
  }
})();
