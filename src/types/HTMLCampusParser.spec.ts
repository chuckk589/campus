/* eslint "prettier/prettier": ['error', { printWidth: 250 }]*/
/*eslint @typescript-eslint/ban-ts-comment: "off"*/

import { faker } from '@faker-js/faker';
import { HTMLCampusParser } from './interfaces';
import { JSDOM } from 'jsdom';
import { questions } from 'test/utils/helpers/questions';
describe('HtmlCampusParser', () => {
  it('Should return a number', () => {
    //@ts-ignore
    const hash = HTMLCampusParser.bde_hash(faker.random.word());
    expect(hash).toEqual(expect.any(Number));
  });
  it('Should return question type', () => {
    for (let i = 0; i < questions.length; i++) {
      const dom = new JSDOM(questions[i].page);
      const document = dom.window.document as any;
      const type = HTMLCampusParser.get_question_type(document);
      expect(type).toMatchObject({ resultype: questions[i].question_type, question_idhash: expect.any(String) });
    }
  });
  describe('(parse_question_data)', () => {
    it('Should return null if html invalid', () => {
      const res1 = HTMLCampusParser.parse_question_data('invalid html', 0);
      const res2 = HTMLCampusParser.parse_question_data(undefined, 1);
      expect(res1).toBeNull();
      expect(res2).toBeNull();
    });
  });
});
