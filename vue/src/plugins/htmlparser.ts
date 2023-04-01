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
  static bde_mainfunc(type: number) {
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
}
