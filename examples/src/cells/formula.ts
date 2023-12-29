import { Parser, char, charSequence, digit, join, joinOneOrMore, letter, map, maybe, number, oneOf, oneOrMore, sequence, text } from "./parser"

export type GetCellValue = (identifier: string) => string | number

const cellIdentifier = map(join([letter, joinOneOrMore(digit)]), (id) => (get: GetCellValue) => get(id))

const cellRange = map(sequence(
  letter,
  joinOneOrMore(digit),
  char(":"),
  letter,
  joinOneOrMore(digit)
), ([startLetter, startNumber, _, endLetter, endNumber]) => {
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
  return map(parser, (value) => () => value)
}

const binaryArgument = oneOf([cellIdentifier, primitive(number)])

const addFunction = map(sequence(
  charSequence("ADD("),
  binaryArgument,
  char(","),
  binaryArgument,
  char(")")
), (components) => {
  return (get: GetCellValue) => {
    return Number(components[1](get)) + Number(components[3](get))
  }
})

const naryArgument = oneOf([
  cellRange,
  map(cellIdentifier, (val) => [val]),
  map(primitive(number), (val) => [val])
])

const sumFunction = map(sequence(
  charSequence("SUM("),
  naryArgument,
  maybe(oneOrMore(map(sequence(
    char(","),
    naryArgument
  ), ([_, argument]) => argument)), []),
  char(")")
), (components: Array<any>) => {
  return (get: GetCellValue) => {
    let args: Array<(get: GetCellValue) => string> = []
    args = args.concat(components[1])
    components[2].forEach((c: Array<any>) => {
      args = args.concat(c)
    })
    return args.map(arg => Number(arg(get))).reduce((acc, cur) => acc + cur, 0)
  }
})

const formula = map(sequence(
  char("="),
  oneOf([
    cellIdentifier,
    addFunction,
    sumFunction
  ])
), ([_, formula]) => formula)

export const cellDefinition = oneOf([
  formula,
  primitive(number),
  primitive(text)
])

