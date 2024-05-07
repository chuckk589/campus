import fs from 'fs';
import { AxiosRequestConfig, Method, AxiosResponse } from 'axios';
import axios from 'axios';
import https from 'https';
const logpath = process.argv.find((arg) => arg.startsWith('--lp='))?.split('=')[1];
function request(options: { method: Method; url: string; data?: any } & AxiosRequestConfig, retries = 3): Promise<AxiosResponse> {
  return new Promise((resolve, reject) => {
    axios({
      method: options.method,
      url: options.url,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      data: options.data,
      ...options,
    })
      .then((response: any) => resolve(response))
      .catch((error: any) => {
        console.log(error);
        if (retries > 0) {
          setTimeout(() => {
            return request(options, retries - 1);
          }, 1000);
        } else {
          reject(error);
        }
      });
  });
}

// }https://campus.fa.ru/mod/quiz/attempt.php?attempt=1050855&cmid=186319
(async () => {
  for (let i = 0; i < 1; i++) {
    request({
      method: 'GET',
      url: 'https://campus.fa.ru/mod/quiz/attempt.php?attempt=1407174\u0026cmid=688230\u001b',
      headers: { Cookie: `MoodleSessionnewcampusfaru=srkug77p0au0qtfda2tsvlb5pt` },
    }).then((response) => console.log('done', i));
    // .then((response) => console.log(response.data));
  }
})();
// (async () => {
//   const jwt =
//     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNzAzMjM2ODI0fQ.hd30BShUN10iE1Gk_VSnNW8B4vd_eGrzHbPCyXckHiM';
//   const data = await request({
//     method: 'POST',
//     url: 'http://85.193.87.251/v1/attempt/lazy',
//     headers: { Authorization: `Bearer ${jwt}` },
//     data: {
//       endRow: 82,
//       startRow: 0,
//       filterModel: {},
//       groupKeys: [],
//       pivotCols: [],
//       pivotMode: false,
//       rowGroupCols: [],
//       sortModel: [],
//       valueCols: [],
//     },
//   });
//   if (logpath) {
//     const file = fs.readFileSync(logpath, 'utf-8');
//     const lines = file.split('\n');
//     const pairs = new Set<string>();
//     for (let i = 0; i < lines.length; i++) {
//       const matches = lines[i].matchAll(/Request failed.*attempt=(\d*)\\u0026cmid=(\d*)/g);

//       if (matches) {
//         for (const match of matches) {
//           pairs.add(match[1]);
//         }
//       }
//     }
//     console.log(pairs);
//     for (const pair of pairs) {
//       if (!data.data.rows.find((row: any) => row.attemptId == pair)) {
//         console.log('not found', pair);
//       } else {
//         console.log('found', pair);
//       }
//     }
//   }
// })();
//{"log":"[08:46:38.392] \u001b[31mERROR\u001b[39m (92): \u001b[36mRequest failed with status code undefined, retries left: 3, url: https://campus.fa.ru/mod/quiz/attempt.php?attempt=1406919\u0026cmid=692410\u0026page=23#\u001b[39m \u001b[90m{\"reqId\":685,\"context\":\"AxiosRetryService\"}\u001b[39m\r\n","stream":"stdout","time":"2024-05-04T08:46:38.774446995Z"}
