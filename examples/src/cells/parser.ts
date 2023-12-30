
export interface ParseSuccess<T> {
  type: "success"
  value: T
  next: string
}

export interface ParseFailure {
  type: "failure"
}

export function failureResult(): ParseFailure {
  return {
    type: "failure"
  }
}

export type ParseResult<T> = ParseSuccess<T> | ParseFailure

export type Parser<T> = (message: string) => ParseResult<T>

export function char(c: string): Parser<string> {
  return (message) => {
    if (message[0] === c) {
      return {
        type: "success",
        value: c,
        next: message.substring(1),
      }
    }

    return failureResult()
  }
}

export function oneOf<T>(parsers: Array<Parser<T>>): Parser<T> {
  return (message) => {
    for (const parser of parsers) {
      const result = parser(message)
      if (result.type === "success") {
        return result
      }
    }
    return failureResult()
  }
}

export function oneOrMore<T>(parser: Parser<T>): Parser<Array<T>> {
  return (message) => {
    let matches = 0
    let result: ParseResult<T>
    let next: string = message
    let values: Array<T> = []
    while ((result = parser(next)).type === "success") {
      matches = matches + 1
      next = result.next
      values.push(result.value)
    }
    if (matches > 0) {
      return {
        type: "success",
        value: values,
        next,
      }
    } else {
      return failureResult()
    }
  }
}

export function joinOneOrMore(parser: Parser<string>): Parser<string> {
  return map(oneOrMore(parser), (values) => values.join(""))
}

export function sequence<A>(
  aParser: Parser<A>
): Parser<[A]>;
export function sequence<A, B>(
  aParser: Parser<A>,
  bParser: Parser<B>
): Parser<[A, B]>;
export function sequence<A, B, C>(
  aParser: Parser<A>,
  bParser: Parser<B>,
  cParser: Parser<C>
): Parser<[A, B, C]>;
export function sequence<A, B, C, D>(
  aParser: Parser<A>,
  bParser: Parser<B>,
  cParser: Parser<C>,
  dParser: Parser<D>,
): Parser<[A, B, C, D]>;
export function sequence<A, B, C, D, E>(
  aParser: Parser<A>,
  bParser: Parser<B>,
  cParser: Parser<C>,
  dParser: Parser<D>,
  eParser: Parser<E>
): Parser<[A, B, C, D, E]>;
export function sequence<A, B, C, D, E, F>(
  aParser: Parser<A>,
  bParser: Parser<B>,
  cParser: Parser<C>,
  dParser: Parser<D>,
  eParser: Parser<E>,
  fParser: Parser<F>
): Parser<[A, B, C, D, E, F]>;
export function sequence<A, B, C, D, E, F, G>(
  aParser: Parser<A>,
  bParser: Parser<B>,
  cParser: Parser<C>,
  dParser: Parser<D>,
  eParser: Parser<E>,
  fParser: Parser<F>,
  gParser: Parser<G>
): Parser<[A, B, C, D, E, F, G]>;
export function sequence<A, B, C, D, E, F, G, H>(
  aParser: Parser<A>,
  bParser: Parser<B>,
  cParser: Parser<C>,
  dParser: Parser<D>,
  eParser: Parser<E>,
  fParser: Parser<F>,
  gParser: Parser<G>,
  hParser: Parser<H>
): Parser<[A, B, C, D, E, F, G, H]>;
export function sequence<A, B, C, D, E, F, G, H, I>(
  aParser: Parser<A>,
  bParser: Parser<B>,
  cParser: Parser<C>,
  dParser: Parser<D>,
  eParser: Parser<E>,
  fParser: Parser<F>,
  gParser: Parser<G>,
  hParser: Parser<H>,
  iParser: Parser<I>,
): Parser<[A, B, C, D, E, F, G, H, I,]>;
export function sequence<A, B, C, D, E, F, G, H, I, J>(
  aParser: Parser<A>,
  bParser: Parser<B>,
  cParser: Parser<C>,
  dParser: Parser<D>,
  eParser: Parser<E>,
  fParser: Parser<F>,
  gParser: Parser<G>,
  hParser: Parser<H>,
  iParser: Parser<I>,
  jParser: Parser<J>,
): Parser<[A, B, C, D, E, F, G, H, I, J]>;
export function sequence<T>(...parsers: Array<Parser<T>>): Parser<Array<T>>;
export function sequence<T extends any>(...parsers: Array<Parser<T>>): Parser<Array<any>> {
  return (message) => {
    let next = message
    let values: Array<any> = []
    for (const parser of parsers) {
      const result = parser(next)
      if (result.type === "failure") {
        return failureResult()
      }
      values.push(result.value)
      next = result.next
    }
    return {
      type: "success",
      value: values,
      next
    }
  }
}

export function join(parsers: Array<Parser<string>>): Parser<string> {
  return map(sequence(...parsers), (values) => values.join(""))
}

export function map<T, R>(parser: Parser<T>, map: (value: T) => R): Parser<R> {
  return (message) => {
    const result = parser(message)
    if (result.type === "success") {
      return {
        type: "success",
        value: map(result.value),
        next: result.next,
        context: {}
      }
    } else {
      return failureResult()
    }
  }
}

export function succeed<T>(value: T): Parser<T> {
  return (message) => {
    return {
      type: "success",
      value,
      next: message
    }
  }
}

export function maybe<T>(parser: Parser<T>, alt: T): Parser<T> {
  return oneOf([parser, succeed(alt)])
}

export function test<T>(parser: Parser<T>, predicate: (value: T) => boolean): Parser<T> {
  return (message) => {
    const result = parser(message)
    if (result.type === "success" && predicate(result.value)) {
      return result
    } else {
      return failureResult()
    }
  }
}

export function lazy<T>(generator: () => Parser<T>): Parser<T> {
  return (message) => generator()(message)
}

export function charSequence(expected: string): Parser<string> {
  return join(Array.from(expected).map(char))
}

export const letter = oneOf(Array.from("aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ").map(char))
export const punctuation = oneOf(Array.from("!?,.';:#@$%^&*()+=-_<>/~`{}[]\\|").map(char))
export const word = joinOneOrMore(letter)
export const text = joinOneOrMore(oneOf([word, char(" "), punctuation]))

export const digit = oneOf(Array.from("1234567890").map(char))
export const number = join([
  maybe(char("-"), ""),
  joinOneOrMore(digit),
  maybe(join([char("."), joinOneOrMore(digit)]), "")
])

