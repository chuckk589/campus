declare namespace jest {
  interface Matchers<R> {
    toEqualExcept<T extends { [key: string]: any } | Array<{ [key: string]: any }>>(target: T, except: string | string[]);
  }
}
