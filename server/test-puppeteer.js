const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent('<html><body><h1>Hello PDF!</h1></body></html>', { waitUntil: 'networkidle0' });
  await page.pdf({ path: 'test.pdf', format: 'A4', printBackground: true });
  await browser.close();
  console.log('PDF created as test.pdf');
})(); 