/* eslint-disable no-constant-condition */
export interface QuizAnswerRequest extends Request {
  user: {
    id: string;
    name: string;
  };
}
export type RequestWithVersion = Request & { headers: { 'x-version': string } } & QuizAnswerRequest;

export class HTMLCampusParser {
  private static bde_hash(text: string) {
    let hash = 0,
      i,
      chr;
    for (i = 0; i < text.length; i++) {
      chr = text.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
    }
    return hash;
  }

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

  static get_question_type(document: HTMLElement): { resultype: number; question_idhash: string } {
    let resultype = -1;
    let question_idhash = '';
    while (true) {
      const divqtext = document.querySelector('div.qtext');
      if (!divqtext) break;
      let text = divqtext.textContent.trim();
      const listimg = divqtext.querySelectorAll<HTMLImageElement>('img');
      if (listimg.length > 0) {
        for (let i = 0; i < listimg.length; i++) {
          text += this.bde_fromsrc(listimg[i].src);
        }
      }

      let hash = this.bde_hash(text);

      const list_listtext = [];

      let listtext = document.querySelectorAll('table.answer td.text');
      if (listtext.length > 0) {
        for (let i = 0; i < listtext.length; i++) {
          const thistext = listtext[i].textContent.trim().toLowerCase();
          list_listtext.push(thistext);
        }
      } else {
        listtext = document.querySelectorAll('div.answer input[type="checkbox"]');
        if (listtext.length == 0) listtext = document.querySelectorAll('div.answer input[type="radio"]');
        if (listtext.length > 0) {
          for (let i = 0; i < listtext.length; i++) {
            let thisvalue = listtext[i].parentNode.textContent.trim().toLowerCase();
            if (thisvalue.length == 0) {
              const elemimg = listtext[i].parentNode.querySelector('img');
              if (elemimg) {
                thisvalue = this.bde_fromsrc(elemimg.src);
              }
            }
            list_listtext.push(thisvalue);
          }
        } else {
          listtext = document.querySelectorAll('div.answer.ordering li');
          if (listtext.length > 0) {
            for (let i = 0; i < listtext.length; i++) {
              const thistext = listtext[i].textContent.trim().toLowerCase();
              list_listtext.push(thistext);
            }
          }
        }
      }

      list_listtext.sort();
      for (let i = 0; i < list_listtext.length; i++) {
        const hash1 = this.bde_hash(list_listtext[i]);
        hash += hash1;
      }

      question_idhash = hash.toString();
      const maindiv = document.querySelector('div[id*="question"]');
      if (!maindiv) {
        break;
      }
      const classname = maindiv.className;
      if (classname.indexOf('multichoice') > 0) {
        let listelems = document.querySelectorAll('div.answer input[type="checkbox"]');
        if (listelems.length > 0) {
          resultype = 0;
          break;
        }
        listelems = document.querySelectorAll('div.answer input[type="radio"]');
        if (listelems.length > 0) {
          resultype = 2;
          break;
        }
      } else if (classname.indexOf('shortanswer') > 0) {
        resultype = 3;
        break;
      } else if (classname.indexOf('ddmatch') > 0) {
        resultype = 5;
        break;
      } else if (classname.indexOf('match') > 0) {
        resultype = 1;
        break;
      } else if (classname.indexOf('ordering') > 0) {
        resultype = 4;
        break;
      }
      break;
    }
    return { resultype, question_idhash };
  }
  static get_template(document: HTMLElement, question_type: number) {
    switch (question_type) {
      case 0: {
        const jsondata = [];
        let issuccess = false;

        const listelems = document.querySelectorAll('div.answer input[type="checkbox"]') as any;
        if (listelems.length > 0) {
          for (let i = 0; i < listelems.length; i++) {
            const thischecked = listelems[i].checked;
            let thisvalue = listelems[i].parentNode.textContent.trim().toLowerCase();
            if (thisvalue.length == 0) {
              const elemimg = listelems[i].parentNode.querySelector('img');
              if (elemimg) {
                thisvalue = this.bde_fromsrc(elemimg.src);
              }
            }
            if (thischecked) issuccess = true;
            jsondata.push({ checked: thischecked, value: thisvalue });
          }
        }

        if (issuccess) return JSON.stringify(jsondata);
        else return '';
      }
    }
  }
}
