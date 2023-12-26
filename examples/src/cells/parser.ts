import { GetState } from "@spheres/store"
import { cellContainer } from "./state"

interface ParseSuccess {
  type: "success"
  value: string
  next: string
  context: Record<string, any>
}

interface ParseFailure {
  type: "failure"
}

function failureResult(): ParseFailure {
  return {
    type: "failure"
  }
}

type ParseResult = ParseSuccess | ParseFailure

type Parser = (message: string) => ParseResult

function char(c: string): Parser {
  return (message) => {
    if (message[0] === c) {
      return {
        type: "success",
        value: c,
        next: message.substring(1),
        context: {}
      }
    }

    return failureResult()
  }
}

function oneOf(parsers: Array<Parser>): Parser {
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

function someOrMore(minimumCount: number, parser: Parser): Parser {
  return (message) => {
    let matches = 0
    let result: ParseResult
    let next: string = message
    let value: string = ""
    while ((result = parser(next)).type === "success") {
      matches = matches + 1
      next = result.next
      value = value + result.value
    }
    if (matches >= minimumCount) {
      return {
        type: "success",
        value,
        next,
        context: {}
      }
    } else {
      return failureResult()
    }
  }
}

function sequence(parsers: Array<Parser>): Parser {
  return (message) => {
    let next = message
    let value = ""
    let context = {}
    for (const parser of parsers) {
      const result = parser(next)
      if (result.type === "failure") {
        return failureResult()
      }
      value += result.value
      next = result.next
      context = { ...context, ...result.context }
    }
    return {
      type: "success",
      value,
      next,
      context
    }
  }
}

function capture(name: string, parser: Parser, map?: (value: string) => any): Parser {
  return (message) => {
    const result = parser(message)
    if (result.type === "success") {
      return {
        type: "success",
        value: result.value,
        next: result.next,
        context: {
          [name]: map ? map(result.value) : result.value
        }
      }
    }
    return failureResult()
  }
}

const letter = oneOf(Array.from("aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ").map(char))
const word = someOrMore(1, letter)

const digit = oneOf(Array.from("1234567890").map(char))
const wholeNumber = someOrMore(1, digit)

const cellIdentifier = sequence([letter, digit])

const formula = sequence([char("="), capture("formula", cellIdentifier, (value) => {
  return (get: GetState) => get(get(cellContainer(value)))
})])

export const cellDefinition = oneOf([word, wholeNumber, formula])

