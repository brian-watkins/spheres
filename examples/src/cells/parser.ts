
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

function oneOrMore<T>(parser: Parser<T>): Parser<Array<T>> {
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

function joinOneOrMore(parser: Parser<string>): Parser<string> {
  return mapValue(oneOrMore(parser), (values) => values.join(""))
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

function maybe<T>(parser: Parser<T>, alt: T): Parser<T> {
  return (message) => {
    const result = parser(message)
    if (result.type === "failure") {
      return {
        type: "success",
        value: alt,
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
const word = joinOneOrMore(letter)
const text = joinOneOrMore(oneOf([word, char(" "), punctuation]))

const digit = oneOf(Array.from("1234567890").map(char))
const number = join([
  maybe(char("-"), ""),
  joinOneOrMore(digit),
  maybe(join([char("."), joinOneOrMore(digit)]), "")
])

export type GetCellValue = (identifier: string) => string | number

const cellIdentifier = mapValue(join([letter, digit]), (id) => (get: GetCellValue) => get(id))

const cellRange = sequence([
  letter,
  digit,
  char(":"),
  letter,
  digit
], ([startLetter, startNumber, _, endLetter, endNumber]) => {
  let cells: Array<(get: GetCellValue) => string | number> = []
  const startLetterIndex = startLetter.toUpperCase().charCodeAt(0)
  const endLetterIndex = endLetter.toUpperCase().charCodeAt(0)

  for (let l = startLetterIndex; l <= endLetterIndex; l++) {
    for (let i = Number(startNumber); i <= Number(endNumber); i++) {
      cells.push((get) => get(`${String.fromCharCode(l)}${i}`))
    }  
  }
  return cells
})

function primitive(parser: Parser<string>): Parser<(get: GetCellValue) => string | number> {
  return mapValue(parser, (value) => () => value)
}

const binaryArgument = oneOf([cellIdentifier, primitive(number)])

const addFunction = sequence([
  charSequence("ADD("),
  binaryArgument,
  char(","),
  binaryArgument,
  char(")")
], (components) => {
  return (get: GetCellValue) => {
    return Number(components[1](get)) + Number(components[3](get))
  }
})

const naryArgument = oneOf([
  cellRange,
  mapValue(cellIdentifier, (val) => [val]),
  mapValue(primitive(number), (val) => [val])
])

const sumFunction = sequence([
  charSequence("SUM("),
  naryArgument,
  maybe(oneOrMore(sequence([
    char(","),
    naryArgument
  ], ([_, argument]) => argument)), []),
  char(")")
], (components: Array<any>) => {
  return (get: GetCellValue) => {
    let args: Array<(get: GetCellValue) => string> = []
    args = args.concat(components[1])
    components[2].forEach((c: Array<any>) => {
      args = args.concat(c)
    })
    return args.map(arg => Number(arg(get))).reduce((acc, cur) => acc + cur, 0)
  }
})

const formula = sequence<(get: GetCellValue) => string | number>([
  char("="),
  oneOf([
    cellIdentifier,
    addFunction,
    sumFunction
  ])
], ([_, formula]) => formula)

export const cellDefinition = oneOf([
  formula,
  primitive(number),
  primitive(text)
])

