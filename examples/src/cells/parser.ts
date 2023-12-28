
interface ParseSuccess<T> {
  type: "success"
  value: T
  next: string
}

interface ParseFailure {
  type: "failure"
}

function failureResult(): ParseFailure {
  return {
    type: "failure"
  }
}

type ParseResult<T> = ParseSuccess<T> | ParseFailure

type Parser<T> = (message: string) => ParseResult<T>

function char(c: string): Parser<string> {
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

function oneOf<T>(parsers: Array<Parser<T>>): Parser<T> {
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

function oneOrMore(parser: Parser<string>): Parser<string> {
  return (message) => {
    let matches = 0
    let result: ParseResult<string>
    let next: string = message
    let value: string = ""
    while ((result = parser(next)).type === "success") {
      matches = matches + 1
      next = result.next
      value = value + result.value
    }
    if (matches > 0) {
      return {
        type: "success",
        value,
        next,
      }
    } else {
      return failureResult()
    }
  }
}

function sequence<T>(parsers: Array<Parser<any>>, map: (values: any) => T): Parser<T> {
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
      value: map(values),
      next
    }
  }
}

function join(parsers: Array<Parser<string>>): Parser<string> {
  return sequence(parsers, (components) => components.join(""))
}

function mapValue<T, R>(parser: Parser<T>, map: (value: T) => R): Parser<R> {
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

function maybe(parser: Parser<string>): Parser<string> {
  return (message) => {
    const result = parser(message)
    if (result.type === "failure") {
      return {
        type: "success",
        value: "",
        next: message
      }
    } else {
      return result
    }
  }
}

function charSequence(expected: string): Parser<string> {
  return join(Array.from(expected).map(char))
}

const letter = oneOf(Array.from("aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ").map(char))
const punctuation = oneOf(Array.from("!?,.';:#@$%^&*()+-_<>/~`{}[]\\|").map(char))
const word = oneOrMore(letter)
const text = oneOrMore(oneOf([word, char(" "), punctuation]))

const digit = oneOf(Array.from("1234567890").map(char))
const number = join([
  maybe(char("-")),
  oneOrMore(digit),
  maybe(join([char("."), oneOrMore(digit)]))
])

export type GetCellValue = (identifier: string) => string | number

const cellIdentifier = sequence([letter, digit], (components) => {
  const id = components.join("")
  return (get: GetCellValue) => get(id)
})

function primitive(parser: Parser<string>): Parser<(get: GetCellValue) => string | number> {
  return mapValue(parser, (value) => () => value)
}

const addFunction = sequence([
  charSequence("ADD("),
  oneOf([cellIdentifier, primitive(number)]),
  char(","),
  oneOf([cellIdentifier, primitive(number)]),
  char(")")
], (components) => {
  return (get: GetCellValue) => {
    return Number(components[1](get)) + Number(components[3](get))
  }
})

const formula = sequence<(get: GetCellValue) => string | number>([
  char("="),
  oneOf([
    cellIdentifier,
    addFunction
  ])
], ([_, formula]) => formula)

export const cellDefinition = oneOf([
  primitive(text),
  primitive(number),
  formula
])

