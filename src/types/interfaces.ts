import { JSDOM } from 'jsdom';

/* eslint-disable no-constant-condition */
export interface QuizAnswerRequest extends Request {
  user: {
    id: string;
    name: string;
  };
}
export type RequestWithVersion = Request & { headers: { 'x-version': string } } & QuizAnswerRequest;

export interface IServerSideGetRowsRequest {
  // First row requested or undefined for all rows.
  startRow: number | undefined;
  // Index after the last row required row or undefined for all rows.
  endRow: number | undefined;
  // Columns that are currently row grouped.
  rowGroupCols: ColumnVO[];
  // Columns that have aggregations on them.
  valueCols: ColumnVO[];
  // Columns that have pivot on them.
  pivotCols: ColumnVO[];
  // Defines if pivot mode is on or off.
  pivotMode: boolean;
  // What groups the user is viewing.
  groupKeys: string[];
  // If filtering, what the filter model is.
  // If Advanced Filter is enabled, will be of type `AdvancedFilterModel | null`.
  // If Advanced Filter is disabled, will be of type `FilterModel`.
  // filterModel: FilterModel | AdvancedFilterModel | null;
  // If sorting, what the sort model is.
  sortModel: SortModelItem[];
}

interface ColumnVO {
  id: string;
  displayName: string;
  field?: string;
  aggFunc?: string;
}

interface SortModelItem {
  // Column Id to apply the sort to.
  colId: string;
  // Sort direction
  sort: 'asc' | 'desc';
}

export type QuestionType = 0 | 1 | 2 | 3;
export type QuestionPayload<T> = T extends 0 | 2
  ? { subject: string; options: string[] }
  : T extends 1
  ? { subject: string; variants: { text: string; options: string[] }[] }
  : { subject: string };

export type QuestionOutput<T> = T extends 2 ? [string] : T extends 1 | 0 ? string[] : string;
export type QuizQuestionType<T extends QuestionType> = T extends 0 ? 'checkbox' : T extends 1 ? 'select' : T extends 2 ? 'radio' : 'input';
export type ParsedQuizAnswer<T extends QuestionType> = {
  question: QuestionPayload<T>;
  answer: QuestionOutput<T>;
  type: {
    id: T;
    name: QuizQuestionType<T>;
  };
};
export class HTMLCampusParser {
  //legacy, dont touch
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
  //legacy, dont touch
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
  //legacy, dont touch
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
  // static get_template(document: HTMLElement, question_type: number) {
  //   switch (question_type) {
  //     case 0: {
  //       const jsondata = [];
  //       let issuccess = false;

  //       const listelems = document.querySelectorAll('div.answer input[type="checkbox"]') as any;
  //       if (listelems.length > 0) {
  //         for (let i = 0; i < listelems.length; i++) {
  //           const thischecked = listelems[i].checked;
  //           let thisvalue = listelems[i].parentNode.textContent.trim().toLowerCase();
  //           if (thisvalue.length == 0) {
  //             const elemimg = listelems[i].parentNode.querySelector('img');
  //             if (elemimg) {
  //               thisvalue = this.bde_fromsrc(elemimg.src);
  //             }
  //           }
  //           if (thischecked) issuccess = true;
  //           jsondata.push({ checked: thischecked, value: thisvalue });
  //         }
  //       }

  //       if (issuccess) return JSON.stringify(jsondata);
  //       else return '';
  //     }
  //   }
  // }
  // static extract_text_DEV(html: string, question_type: QuestionType, isService = false): any {
  //   if (question_type === 0 || question_type === 2) {
  //     //radio or checkbox
  //     const output: any = { subject: '', options: [] };
  //     const document = new JSDOM(html).window.document;
  //     // output.subject = document.querySelector('div.qtext').textContent;
  //     output.subject = this.extract_text_from_html(document.querySelector('div.qtext'));
  //     const variants = document.querySelectorAll('.answer p');
  //     for (let i = 0; i < variants.length; i++) {
  //       const variant = variants[i];
  //       // let content = variant.textContent;
  //       let content = this.extract_text_from_html(variant);
  //       if (content.length === 0) {
  //         const img = variant.querySelector('img');
  //         if (img) content = new URL(img.src, process.env.HOSTNAME).href;
  //       }
  //       output.options.push(content);
  //     }

  //     return isService
  //       ? output
  //       : output.subject +
  //           '\n' +
  //           output.options.reduce((acc: string, option: string, index: number) => acc + '\n' + index + ') ' + option, '');
  //   } else if (question_type === 1) {
  //     //select
  //     const output: any = { subject: '', variants: [] };
  //     const document = new JSDOM(html).window.document;
  //     // output.subject = document.querySelector('div.qtext').textContent;
  //     output.subject = this.extract_text_from_html(document.querySelector('div.qtext'));
  //     const variants = document.querySelectorAll('table.answer tr');
  //     for (let i = 0; i < variants.length; i++) {
  //       const variant = variants[i];
  //       // let content = variant.querySelector('td.text').textContent;
  //       let content = this.extract_text_from_html(variant.querySelector('td.text'));
  //       if (content.length === 0) {
  //         const img = variant.querySelector('td.text img') as HTMLImageElement;
  //         if (img) content = new URL(img.src, process.env.HOSTNAME).href;
  //       }
  //       output.variants.push({
  //         text: content,
  //         options: Array.from(variant.querySelectorAll('td.control select option')).map((option) => option.textContent),
  //       });
  //     }
  //     return isService
  //       ? output
  //       : output.subject +
  //           '\n' +
  //           output.variants.reduce((acc: string, variant: any) => {
  //             acc += '\n' + variant.text;
  //             acc += '\n' + variant.options.reduce((acc: string, option: string, index: number) => acc + '\n' + index + ') ' + option, '');
  //             return acc;
  //           }, '');
  //   } else if (question_type === 3) {
  //     const output: any = { subject: '' };
  //     const document = new JSDOM(html).window.document;
  //     // output.subject = document.querySelector('div.qtext').textContent;
  //     output.subject = this.extract_text_from_html(document.querySelector('div.qtext'));
  //     //apply image if exists
  //     const img = document.querySelector('div.qtext img') as HTMLImageElement;
  //     if (img) output.subject += '\n' + new URL(img.src, process.env.HOSTNAME).href;
  //     return isService ? output : output.subject;
  //   }
  // }
  // static extract_answers_DEV(html: string, question_type: QuestionType, htmlAnswer: string): any {
  //   try {
  //     if (htmlAnswer === null) throw new Error('htmlAnswer is null');
  //     const parsed = JSON.parse(htmlAnswer);
  //     if (question_type === 0 || question_type === 2) {
  //       //radio or checkbox
  //       return parsed.reduce((acc: string[], option: { checked: boolean; value: string }, index: number) => {
  //         if (option.checked) acc.push(index.toString());
  //         return acc;
  //       }, []);
  //     } else if (question_type === 1) {
  //       //select
  //       // const payload = this.extract_text_DEV(html, question_type, true);
  //       return parsed.map((option: { text: string; value: string }, index: number) => {
  //         const variant = payload.variants[index].options.findIndex((el: string) => el.toLowerCase() === option.value);
  //         return variant.toString();
  //       });
  //     } else if (question_type === 3) {
  //       return parsed.text;
  //     }
  //   } catch (error) {
  //     return null;
  //   }
  // }
  static parse_question_data<T extends QuestionType>(html: string, question_type: T): QuestionPayload<T> {
    try {
      if (!html || !html.length) throw new Error();
      const document = new JSDOM(html).window.document;
      let output: QuestionPayload<T>;
      if (question_type === 0 || question_type === 2) {
        output = { subject: '', options: [] } as any;
        output.subject = this.extract_text_from_html(document.querySelector('div.qtext'));
        // output.options = Array.from(document.querySelectorAll('.answer p')).map((variant) => this.extract_text_from_html(variant));
      }
      return output;
    } catch (error) {
      return null;
    }
  }
  // static parse_quiz_data<T extends QuestionType>(html: string, question_type: T, jsonAnswer: string | null): ParsedQuizAnswer<T> {
  //   try {
  //   } catch (error) {}
  //   return '' as any;
  // }
  private static *extract_children(element: Element): any {
    if (element.children.length === 0) {
      yield element.textContent;
    } else {
      for (let i = 0; i < element.children.length; i++) {
        yield* this.extract_children(element.children[i]);
      }
    }
  }
  private static extract_text_from_html(element: Element) {
    let text = '';
    //element may have lots of children with urls and images
    //iterate over all children and extract text only, separate with space
    for (const child of this.extract_children(element)) {
      text += child + ' ';
    }
    return text.replaceAll(/ {2}/g, ' ').trim();
  }
}
