import { expect } from '@jest/globals';

function toEqualExcept<T extends { [key: string]: any } | Array<{ [key: string]: any }>>(actual: T, target: T, except: string | string[]) {
  const exceptKeys = Array.isArray(except) ? except : [except];
  const _actual = Array.isArray(actual) ? actual : [actual];
  const _target = Array.isArray(target) ? target : [target];
  const failedEntries: any = [];
  const pass = _actual.every((item, index) => {
    return Object.keys(item).every((key) => {
      if (exceptKeys.includes(key)) return true;
      try {
        expect(item[key]).toEqual(_target[index][key]);
        return true;
      } catch (error) {
        failedEntries.push({ index, key, actual: item[key], expected: _target[index][key] });
        return false;
      }
    });
  });
  return {
    pass,
    message: () => `Expected arrays of objects to be equal except some fields\n${JSON.stringify(failedEntries, null, 2)}`,
  };
}
expect.extend({
  toEqualExcept,
});
