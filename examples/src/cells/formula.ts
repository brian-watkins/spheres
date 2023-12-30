import { Parser, char, charSequence, digit, join, joinOneOrMore, lazy, letter, map, maybe, number, oneOf, oneOrMore, sequence, test, text } from "./parser"

export type GetCellValue = (identifier: string) => string | number
export type FormulaResult = (get: GetCellValue) => string | number

const cellIdentifier = map(join([letter, joinOneOrMore(digit)]), (id) => (get: GetCellValue) => get(id))

const cellRange = map(sequence(
  letter,
  joinOneOrMore(digit),
  char(":"),
  letter,
  joinOneOrMore(digit)
), ([startLetter, startNumber, _, endLetter, endNumber]) => {
  let cells: Array<FormulaResult> = []
  const startLetterIndex = startLetter.toUpperCase().charCodeAt(0)
  const endLetterIndex = endLetter.toUpperCase().charCodeAt(0)

  for (let l = startLetterIndex; l <= endLetterIndex; l++) {
    for (let i = Number(startNumber); i <= Number(endNumber); i++) {
      cells.push((get) => get(`${String.fromCharCode(l)}${i}`))
    }
  }
  return cells
})

function primitive(parser: Parser<string>): Parser<FormulaResult> {
  return map(parser, (value) => () => value)
}

const cellFunction = lazy(() => {
  return oneOf([
    addFunction,
    subtractFunction,
    sumFunction
  ])
})

const binaryArgument = oneOf([cellIdentifier, cellFunction, primitive(number)])

function binaryFunction(name: string, handler: (right: number, left: number) => number): Parser<FormulaResult> {
  return map(sequence(
    charSequence(`${name}(`),
    binaryArgument,
    char(","),
    binaryArgument,
    char(")")
  ), ([_, right, __, left, ___]) => {
    return (get: GetCellValue) => {
      return handler(Number(right(get)), Number(left(get)))
    }
  })
}

const addFunction = binaryFunction("ADD", (right, left) => right + left)
const subtractFunction = binaryFunction("SUB", (right, left) => right - left)

const naryArgument = oneOf([
  cellRange,
  map(cellIdentifier, (val) => [val]),
  map(cellFunction, (val) => [val]),
  map(primitive(number), (val) => [val])
])

function naryFunction(name: string, handler: (args: Array<number>) => number): Parser<FormulaResult> {
  return map(sequence(
    charSequence(`${name}(`),
    naryArgument,
    maybe(oneOrMore(map(sequence(
      char(","),
      naryArgument
    ), ([_, argument]) => argument)), []),
    char(")")
  ), (components: Array<any>) => {
    return (get: GetCellValue) => {
      let args: Array<FormulaResult> = []
      args = args.concat(components[1])
      components[2].forEach((c: Array<any>) => {
        args = args.concat(c)
      })
      return handler(args.map(arg => Number(arg(get))))
    }
  })
}

const sumFunction = naryFunction("SUM", (args) => args.reduce((acc, cur) => acc + cur, 0))

const formula = map(sequence(
  char("="),
  oneOf([
    cellIdentifier,
    cellFunction
  ])
), ([_, formula]) => formula)

const isNotAFormula = (value: string) => !value.startsWith("=")

export const cellDefinition = oneOf([
  formula,
  primitive(number),
  primitive(test(text, isNotAFormula))
])

