import puppeteer from 'puppeteer';
export async function getCampusCookie() {
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
