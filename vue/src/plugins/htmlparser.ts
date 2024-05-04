export class HTMLCampusParser {
  private static bde_fromsrc(img_src: string) {
    let text = '';
    if (img_src.length > 0) {
      const list_src = img_src.split('/');
      if (list_src.length >= 3) {
        text = list_src[list_src.length - 2] + list_src[list_src.length - 1];
      }
    }
    return text;
  }
  static bde_get_answer(type: number, document: HTMLElement) {
    if (type == 0) {
      const jsondata = [];
      const listelems = document.querySelectorAll(
        'div.answer input[type="checkbox"]',
      ) as unknown as HTMLInputElement[];
      if (listelems.length > 0) {
        for (let i = 0; i < listelems.length; i++) {
          const thischecked = listelems[i].checked;
          let thisvalue = listelems[i].parentNode?.textContent
            ?.trim()
            .toLowerCase();
          if (thisvalue?.length == 0) {
            const elemimg = listelems[i].parentNode?.querySelector('img');
            if (elemimg) {
              thisvalue = this.bde_fromsrc(elemimg.src);
            }
          }
          const item = { checked: thischecked, value: thisvalue };
          jsondata.push(item);
        }
      }
      return JSON.stringify(jsondata) || '';
    } else if (type == 1) {
      const jsondata = [];
      const listtext = document.querySelectorAll('table.answer td.text');
      const listselect = document.querySelectorAll(
        'table.answer select',
      ) as unknown as HTMLSelectElement[];
      if (listtext.length > 0 && listtext.length == listselect.length) {
        for (let i = 0; i < listtext.length; i++) {
          let thistext = listtext[i].textContent?.trim().toLowerCase();
          if (thistext?.length == 0) {
            const elemimg = listtext[i].parentNode?.querySelector('img');
            if (elemimg) {
              thistext = this.bde_fromsrc(elemimg.src);
            }
          }
          const thisvalue = listselect[i].options[
            listselect[i].selectedIndex
          ].text
            .trim()
            .toLowerCase();
          const item = { text: thistext, value: thisvalue };
          jsondata.push(item);
        }
      }
      return JSON.stringify(jsondata) || '';
    } else if (type == 2) {
      const jsondata = [];
      const listelems = document.querySelectorAll(
        'div.answer input[type="radio"]',
      ) as unknown as HTMLInputElement[];
      if (listelems.length > 0) {
        for (let i = 0; i < listelems.length; i++) {
          const thischecked = listelems[i].checked;
          let thisvalue = listelems[i].parentNode?.textContent
            ?.trim()
            .toLowerCase();
          if (thisvalue?.length == 0) {
            const elemimg = listelems[i].parentNode?.querySelector('img');
            if (elemimg) {
              thisvalue = this.bde_fromsrc(elemimg.src);
            }
          }
          const item = { checked: thischecked, value: thisvalue };
          jsondata.push(item);
        }
      }

      return JSON.stringify(jsondata) || '';
    } else if (type == 3) {
      const jsondata = { text: '' };

      const el = document.querySelector(
        'span.answer input[type="text"]',
      ) as unknown as HTMLInputElement;
      if (el) {
        jsondata.text = el.value;
      }

      return JSON.stringify(jsondata) || '';
    } else if (type == 4) {
      const jsondata = [];

      const listli = document.querySelectorAll(
        'div.answer.ordering li',
      ) as unknown as HTMLInputElement[];
      if (listli.length > 0) {
        for (let i = 0; i < listli.length; i++) {
          const thistext = listli[i].textContent?.trim().toLowerCase();
          const item = { text: thistext };
          jsondata.push(item);
        }
      }

      return JSON.stringify(jsondata) || '';
    } else if (type == 5) {
      const jsondata = [];

      const listTR = document.querySelectorAll(
        'table.answer tr',
      ) as unknown as HTMLInputElement[];
      if (listTR.length > 0) {
        for (let i = 0; i < listTR.length; i++) {
          const nodeTDText = listTR[i].querySelector('td.text');
          const nodeLI = listTR[i].querySelector(
            'td.control.visibleifjs li[data-id]',
          );
          if (nodeTDText && nodeLI) {
            const thistext = nodeTDText.textContent?.trim().toLowerCase();
            const thisvalue = nodeLI.textContent?.trim().toLowerCase();
            const item = { text: thistext, value: thisvalue };
            jsondata.push(item);
          }
        }
      }

      return JSON.stringify(jsondata) || '';
    }
  }
  //this is used to fill answers only
  static bde_mainfunc(answerData: string, type: number, document: HTMLElement) {
    try {
      const jsonArr = JSON.parse(answerData);
      let answerElements;
      if (type == 0) {
        //https://campus.fa.ru/mod/quiz/view.php?id=186319 checkbox images
        answerElements = document.querySelectorAll(
          'div.answer input[type="checkbox"]',
        ) as NodeListOf<HTMLInputElement>;
        for (const box of answerElements) {
          const checkboxValue =
            box.parentNode?.textContent?.trim().toLowerCase() ||
            this.bde_fromsrc(box.parentNode?.querySelector('img')?.src || '');
          const state = jsonArr.find(
            (e: any) => e.value == checkboxValue,
          )?.checked;
          if (state == box.checked) continue;
          box.checked = state;
        }
      } else if (type == 1) {
        //https://campus.fa.ru/mod/quiz/attempt.php?attempt=1020486&cmid=483589&page=2 select example
        const answerTexts = document.querySelectorAll('table.answer td.text');
        answerElements = document.querySelectorAll(
          'table.answer select',
        ) as NodeListOf<HTMLSelectElement>;
        for (let i = 0; i < answerTexts.length; i++) {
          const text =
            answerTexts[i].textContent?.trim().toLowerCase() ||
            this.bde_fromsrc(answerTexts[i].querySelector('img')?.src || '');
          const value = jsonArr.find((e: any) => e.text == text)?.value;
          const optionIndex = Array.from(answerElements[i].options).findIndex(
            (e: any) => e.text.trim().toLowerCase() == value,
          );
          //check if update is needed
          if (answerElements[i].selectedIndex == optionIndex) continue;
          answerElements[i].selectedIndex = optionIndex;
        }
      } else if (type == 2) {
        answerElements = document.querySelectorAll(
          'div.answer input[type="radio"]',
        ) as NodeListOf<HTMLInputElement>;
        if (
          Array.from(answerElements)
            .map((e: any) => e.checked)
            .some((e) => e)
        )
          return; //check if already answered
        const checkedValue = jsonArr.find((e: any) => e.checked)?.value;
        let checkedRadio = Array.from(answerElements).find(
          (e: any) =>
            e.parentNode?.textContent?.trim().toLowerCase() == checkedValue,
        );
        if (!checkedRadio)
          checkedRadio = Array.from(answerElements).find(
            (e: any) =>
              this.bde_fromsrc(e.parentNode?.querySelector('img')?.src) ==
              checkedValue,
          ); //image radio
        checkedRadio!.checked = true;
      } else if (type == 3) {
        answerElements = document.querySelector(
          'span.answer input[type="text"]',
        ) as HTMLInputElement;
        if (answerElements.value) return; // check if already answered
        answerElements.value = jsonArr['text'];
      }
    } catch (error) {
      console.log(error);
    }
  }
}
