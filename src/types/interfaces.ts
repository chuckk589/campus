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
/*
 * proctoring test
 * login - 217816
 * pass - YwWc9463
 * https://campus.fa.ru/course/view.php?id=29887
 */
//https://campus.fa.ru/mod/quiz/view.php?id=186319 checkbox images
//https://campus.fa.ru/mod/quiz/attempt.php?attempt=1020486&cmid=483589&page=2 select example
//https://campus.fa.ru/mod/quiz/attempt.php?attempt=1025831&cmid=483591&page=16 radio example with image in answers
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
  static parse_question_answers<T extends QuestionType>(
    payload: QuestionPayload<T>,
    question_type: T,
    jsonAnswer: string | null,
  ): QuestionOutput<T> {
    try {
      if (jsonAnswer === null) throw new Error();
      const parsed = JSON.parse(jsonAnswer);
      if (question_type === 0 || question_type === 2) {
        //radio or checkbox
        return parsed.reduce((acc: string[], option: { checked: boolean }, index: number) => {
          option.checked && acc.push(index.toString());
          return acc;
        }, []);
      } else if (question_type === 1) {
        //select
        return parsed.reduce((acc: string[], option: { text: string; value: string }, index: number) => {
          const variant = (payload as QuestionPayload<1>).variants[index].options.findIndex(
            (el: string) => el.toLowerCase() === option.value,
          );
          acc.push(variant.toString());
          return acc;
        }, []);
      } else if (question_type === 3) {
        return parsed.text;
      }
    } catch (error) {
      return null;
    }
  }
  static parse_question_data<T extends QuestionType>(html: string, question_type: T): QuestionPayload<T> {
    try {
      if (!html || !html.length) throw new Error();
      const document = new JSDOM(html).window.document;
      let output: QuestionPayload<T>;
      if (question_type === 0 || question_type === 2) {
        output = {
          subject: this.extract_text_from_html(document.querySelector('div.qtext')),
          options: Array.from(document.querySelectorAll('.answer p')).map((variant) => this.extract_text_from_html(variant)),
        } as QuestionPayload<T>;
      } else if (question_type === 1) {
        output = {
          subject: this.extract_text_from_html(document.querySelector('div.qtext')),
          variants: Array.from(document.querySelectorAll('table.answer tr')).map((variant) => ({
            text: this.extract_text_from_html(variant.querySelector('td.text')),
            options: Array.from(variant.querySelectorAll('td.control select option')).map((option) => this.extract_text_from_html(option)),
          })),
        } as QuestionPayload<T>;
      } else if (question_type === 3) {
        output = {
          subject: this.extract_text_from_html(document.querySelector('div.qtext')),
        } as QuestionPayload<T>;
      }
      return output;
    } catch (error) {
      return null;
    }
  }
  static convert_to_gpt_payload<T extends QuestionType>(question_type: T, payload: QuestionPayload<T>): string {
    if (question_type === 0 || question_type === 2) {
      return `${payload.subject}\n${(payload as QuestionPayload<0 | 2>).options.join('\n')}`;
    } else if (question_type === 1) {
      return `${payload.subject}\n${(payload as QuestionPayload<1>).variants
        .map((variant) => `${variant.text}\n${variant.options.join('\n')}`)
        .join('\n')}`;
    } else if (question_type === 3) {
      return payload.subject;
    }
  }
  private static *extract_children(element: Element): Generator<string> {
    if (element.children.length === 0) {
      yield element.textContent;
    } else {
      for (let i = 0; i < element.children.length; i++) {
        yield* this.extract_children(element.children[i]);
      }
    }
  }
  private static extract_text_from_html(element: Element): string {
    let text = '';
    //element may have lots of children with urls and images
    //iterate over all children and extract text only, separate with space
    for (const child of this.extract_children(element)) {
      if (!child.length) {
        //check for image
        const img = element.querySelector('img');
        if (img) text += new URL(img.src, process.env.HOSTNAME).href + ' ';
      } else {
        text += child + ' ';
      }
    }
    // console.log(text.charCodeAt(17), text.charCodeAt(18), text[17] == text[18]);
    return text.replaceAll(/ {2}/g, ' ').trim();
  }
}
