const { execSync } = require("child_process");
const { chromium } = require("playwright");
const { createClient } = require("@supabase/supabase-js");

// ✅ تثبيت Chromium وقت التشغيل (في حالة السيرفر مش منزله تلقائيًا)
try {
  execSync("npx playwright install chromium", { stdio: "inherit" });
} catch (e) {
  console.error("فشل تثبيت Chromium:", e);
  process.exit(1);
}

// ✅ إعداد Supabase
const supabaseUrl = "https://lifwzerfuobdppwaowcv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpZnd6ZXJmdW9iZHBwd2Fvd2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTA0NjAsImV4cCI6MjA2MzU4NjQ2MH0.h6hWAkBHdIBV2LITUDWvjGccgIcrpRzuqOv6b1HX8mk";

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("جارٍ الدخول إلى موقع المرور...");
  await page.goto("https://moi.gov.ae");

  // 👇 حط هنا خطوات البحث عن المخالفات
  // مثال توضيحي - هتحتاج تكمل حسب البيانات المطلوبة:
  // await page.fill('input[name="plateNumber"]', '12345');
  // await page.click('button#search');

  // ❗️جمع البيانات
  const data = {
    plateNumber: "12345", // Replace with actual data
    violationCount: 3, // Replace with actual data
    date: new Date().toISOString(),
  };

  // ✅ رفع البيانات لـ Supabase
  const { error } = await supabase.from("violations").insert([data]);

  if (error) {
    console.error("❌ فشل رفع البيانات لـ Supabase:", error.message);
  } else {
    console.log("✅ تم رفع البيانات بنجاح.");
  }

  await browser.close();
})();
