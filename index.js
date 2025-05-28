const puppeteer = require("puppeteer-core");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL || "https://lifwzerfuobdppwaowcv.supabase.co",
  process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpZnd6ZXJmdW9iZHBwd2Fvd2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTA0NjAsImV4cCI6MjA2MzU4NjQ2MH0.h6hWAkBHdIBV2LITUDWvjGccgIcrpRzuqOv6b1HX8mk"
);

// محاولة العثور على Chrome في مواقع مختلفة
function findChrome() {
  const possiblePaths = [
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/local/bin/chrome',
    '/usr/local/bin/chromium',
    '/opt/google/chrome/google-chrome',
    process.env.PUPPETEER_EXECUTABLE_PATH
  ];
  
  for (const path of possiblePaths) {
    if (path && fs.existsSync(path)) {
      return path;
    }
  }
  
  return null;
}

// إضافة endpoints
app.get("/", (req, res) => {
  res.json({ 
    status: "Traffic Scraper is running!",
    chrome: findChrome() ? "Chrome found" : "Chrome not found"
  });
});

app.get("/test-chrome", async (req, res) => {
  try {
    const chromePath = findChrome();
    if (!chromePath) {
      return res.status(500).json({ 
        success: false, 
        error: "Chrome not found on system" 
      });
    }
    
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto('https://httpbin.org/ip');
    const content = await page.content();
    await browser.close();
    
    res.json({ success: true, chromePath, content: content.substring(0, 200) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/scrape", async (req, res) => {
  try {
    const result = await runScraper();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

async function runScraper() {
  console.log("🚀 جارٍ تشغيل المتصفح مع البروكسي...");
  
  const chromePath = findChrome();
  if (!chromePath) {
    throw new Error("Chrome executable not found on system");
  }
  
  console.log(`📍 استخدام Chrome من: ${chromePath}`);
  
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions',
        '--disable-default-apps',
        '--proxy-server=http://proxy.toolip.io:31114'
      ]
    });
    
    const page = await browser.newPage();
    
    // إعداد المصادقة للبروكسي
    await page.authenticate({
      username: process.env.PROXY_USERNAME || '55b3d4be',
      password: process.env.PROXY_PASSWORD || 'vygt7axz1hxw'
    });
    
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    );
    
    console.log("🌐 فتح صفحة تسجيل الدخول...");
    
    await page.goto("https://evg.ae/_layouts/EVG/Login.aspx?language=ar", {
      waitUntil: "networkidle2",
      timeout: 90000,
    });
    
    console.log("📌 الضغط على تبويب المؤسسات...");
    await page.click('#ctl00_cphScrollMenu_rbtnCompany');
    await page.waitForTimeout(3000);
    
    console.log("⏳ في انتظار ظهور الحقول...");
    await page.waitForSelector('#ctl00_cphScrollMenu_txtCompnayTCF', {
      timeout: 60000,
      visible: true,
    });
    
    console.log("✍️ إدخال بيانات المؤسسة...");
    await page.type('#ctl00_cphScrollMenu_txtCompnayTCF', 
      process.env.COMPANY_TCF || '1140163127');
    await page.type('#ctl00_cphScrollMenu_txtLogin', 
      process.env.LOGIN_ID || '1070093478');
    await page.type('#ctl00_cphScrollMenu_txtPassword', 
      process.env.LOGIN_PASSWORD || 'Yzaa3vip@');
    
    console.log("🔐 الضغط على زر تسجيل الدخول...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 90000 }),
      page.click('#ctl00_cphScrollMenu_btnLogin'),
    ]);
    
    console.log("✅ تم تسجيل الدخول بنجاح!");
    
    // إضافة معلومات أكثر تفصيلاً هنا حسب احتياجك
    const data = {
      plateNumber: "12345",
      violationCount: 3,
      date: new Date().toISOString(),
      status: "success"
    };
    
    const { error } = await supabase.from("violations").insert([data]);
    if (error) {
      console.error("❌ فشل رفع البيانات لـ Supabase:", error.message);
      throw error;
    } else {
      console.log("✅ تم رفع البيانات إلى Supabase بنجاح.");
    }
    
    return { success: true, data };
    
  } catch (error) {
    console.error("❌ حصل خطأ:", error.message);
    
    // أخذ لقطة شاشة للأخطاء
    if (browser) {
      try {
        const page = await browser.newPage();
        const screenshot = await page.screenshot({ fullPage: true });
        
        const { error: uploadError } = await supabase.storage
          .from("screenshots")
          .upload(`errors/${Date.now()}.png`, screenshot, {
            contentType: "image/png",
            upsert: true,
          });
          
        if (uploadError) {
          console.error("⚠️ فشل رفع لقطة الشاشة:", uploadError.message);
        } else {
          console.log("📸 تم رفع لقطة الشاشة لتشخيص المشكلة.");
        }
      } catch (screenshotError) {
        console.error("⚠️ فشل في أخذ لقطة الشاشة:", screenshotError.message);
      }
    }
    
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// تشغيل الخادم
app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على البورت ${PORT}`);
  console.log(`🔍 Chrome path: ${findChrome() || 'Not found'}`);
});

// معالج الأخطاء العام
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
