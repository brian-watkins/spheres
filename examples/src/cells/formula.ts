import { Parser, char, charSequence, digit, end, join, joinOneOrMore, just, lazy, letter, map, maybe, number, oneOf, oneOrMore, sequence, test, text } from "./parser"
import { Result } from "./result"

export enum CellErrorType {
  ParseFailure,
  UnableToCalculate
}

export class ParseFailure {
  type: CellErrorType.ParseFailure = CellErrorType.ParseFailure
  constructor (readonly value: string) { }
}

export class UnableToCalculate {
  type: CellErrorType.UnableToCalculate = CellErrorType.UnableToCalculate
}

export type CellError = ParseFailure | UnableToCalculate

export type GetCellValue = (identifier: string) => Result<string, CellError>
export type FormulaResult = (get: GetCellValue) => Result<string, CellError>

function toNumber(val: string): Result<number, CellError> {
  const numberVal = Number(val)
  if (Number.isNaN(numberVal)) {
    return Result.err(new UnableToCalculate())
  } else {
    return Result.ok(numberVal)
  }
}

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
  return map(parser, (value) => () => Result.ok(value))
}

const cellFunction = lazy(() => {
  return oneOf([
    addFunction,
    subtractFunction,
    divideFunction,
    multiplyFunction,
    modFunction,
    sumFunction,
    prodFunction
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
      return Result.all(right(get).andThen(toNumber), left(get).andThen(toNumber))
        .map((args): [number, number] => [args[0], args[1]])  
        .map(args => handler(...args))
        .map(val => val.toString())
    }
  })
}

const addFunction = binaryFunction("ADD", (right, left) => right + left)
const subtractFunction = binaryFunction("SUB", (right, left) => right - left)
const divideFunction = binaryFunction("DIV", (right, left) => right / left)
const multiplyFunction = binaryFunction("MUL", (right, left) => right * left)
const modFunction = binaryFunction("MOD", (right, left) => right % left)

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
      return Result.all(...args.map(arg => arg(get).andThen(toNumber)))
        .map(numbers => handler(numbers))
        .map(val => val.toString())
    }
  })
}

const sumFunction = naryFunction("SUM", (args) => args.reduce((acc, cur) => acc + cur, 0))
const prodFunction = naryFunction("PROD", (args) => args.reduce((acc, cur) => acc * cur, 1))

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
  primitive(just(number)),
  primitive(test(text, isNotAFormula)),
  primitive(end)
])

