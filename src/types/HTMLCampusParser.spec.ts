/* eslint "prettier/prettier": ['error', { printWidth: 250 }]*/
/*eslint @typescript-eslint/ban-ts-comment: "off"*/

import { faker } from '@faker-js/faker';
import { HTMLCampusParser } from './interfaces';
import { JSDOM } from 'jsdom';
import { questions } from 'test/utils/helpers/questions';
describe('HtmlCampusParser', () => {
  it('[bde_hash] Should return a number', () => {
    //@ts-ignore
    const hash = HTMLCampusParser.bde_hash(faker.random.word());
    expect(hash).toEqual(expect.any(Number));
  });
  it('[get_question_type] Should return question type', () => {
    Object.values(questions).forEach((question) => {
      const dom = new JSDOM(question.page);
      const document = dom.window.document as any;
      const type = HTMLCampusParser.get_question_type(document);
      expect(type).toMatchObject({ resultype: question.question_type, question_idhash: expect.any(String) });
    });
  });
  describe('[parse_question_data]', () => {
    it('Should return null if html invalid', () => {
      const res1 = HTMLCampusParser.parse_question_data('invalid html', 0);
      const res2 = HTMLCampusParser.parse_question_data(undefined, 1);
      expect(res1).toBeNull();
      expect(res2).toBeNull();
    });
    it('Should return question data', () => {
      const input1 = HTMLCampusParser.parse_question_data(questions.input1.page, questions.input1.question_type as any);
      // const input2 = HTMLCampusParser.parse_question_data(questions.input2.page, questions.input2.question_type as any);
      // const checkbox1 = HTMLCampusParser.parse_question_data(questions.checkbox1.page, questions.checkbox1.question_type as any);
      // const checkbox2 = HTMLCampusParser.parse_question_data(questions.checkbox2.page, questions.checkbox2.question_type as any);
      // const radio1 = HTMLCampusParser.parse_question_data(questions.radio1.page, questions.radio1.question_type as any);
      // const radio2 = HTMLCampusParser.parse_question_data(questions.radio2.page, questions.radio2.question_type as any);
      // const radio3 = HTMLCampusParser.parse_question_data(questions.radio3.page, questions.radio3.question_type as any);
      // const select1 = HTMLCampusParser.parse_question_data(questions.select1.page, questions.select1.question_type as any);
      // const select2 = HTMLCampusParser.parse_question_data(questions.select2.page, questions.select2.question_type as any);
      // console.log(input1, input2, checkbox1, checkbox2, radio1, radio2, radio3, select1, select2);
      // console.log(input1.subject);
      expect(input1.subject).toMatch('Найти вероятность  Р(-1≤Х≤2,5),\n если функция распределения случайной величины X имеет вид https://campus.fa.ru/pluginfile.php/213980/question/questiontext/1098479/1/1314969/image001.jpg');
    });
  });
});
