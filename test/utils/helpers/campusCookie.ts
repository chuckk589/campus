import puppeteer from 'puppeteer';
import fs from 'fs';
async function getCampusCookie() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://campus.fa.ru/login/index.php');
  await page.type('#username', '220364');
  await page.type('#password', 'TnOa4628');
  await page.click('#loginbtn');
  await page.waitForSelector('#sortingdropdown');
  //get cookies
  const cookies = (await page.cookies()).find((cookie) => cookie.name == 'MoodleSessionnewcampusfaru');
  await browser.close();
  console.log('Cookie acquired: ', cookies);
  return `${cookies.name}=${cookies.value}`;
}

export async function loadExisting(): Promise<string> {
  try {
    const cookie = fs.readFileSync('./test/utils/helpers/cookie.txt', 'utf8');
    //check if not expired 1hr
    if (Date.now() - parseInt(cookie.split('\n')[1]) > 3600000) {
      console.log('Cookie expired, getting new one');
      const newCookie = await getCampusCookie();
      fs.writeFileSync('./test/utils/helpers/cookie.txt', newCookie + '\n' + Date.now());
      return newCookie;
    }
    return cookie.split('\n')[0];
  } catch (e) {
    const cookie = await getCampusCookie();
    fs.writeFileSync('./test/utils/helpers/cookie.txt', cookie + '\n' + Date.now());
    return cookie;
  } finally {
    console.log('Cookie loaded');
  }
}
