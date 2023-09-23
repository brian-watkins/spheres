import { View, view } from "display-party";
import { GetState, Meta, store } from "state-party";
import { celsiusInvalid, celsiusTemperature, farenheitInvalid, farenheitTemperature, temperatureUpdate } from "./state.js";
import { names } from "../helpers/helpers.js";


export function converter(): View {
  return view().main(el => {
    el.children
      .div(el => {
        el.children
          .label(el => {
            el.config.for("celsius")
            el.children.text("Celsius")
          })
          .view(celsiusInput)
      })
      .div(el => {
        el.children
          .label(el => {
            el.config.for("farenheit")
            el.children.text("Farenheit")
          })
          .view(farenheitInput)
      })
  })
}

function celsiusInput(get: GetState): View {
  return view().input(el => {
    el.config
      .id("celsius")
      .type("text")
      .value(get(celsiusTemperature))
      .on({ input: (evt) => store(temperatureUpdate, { celsius: (evt as any).target.value }) })
      .class((get) => inputStyling(get(celsiusInvalid), isError(get(celsiusTemperature.meta))))
  })
}

function farenheitInput(get: GetState): View {
  return view().input(el => {
    el.config
      .id("farenheit")
      .type("text")
      .value(get(farenheitTemperature))
      .on({ input: (evt) => store(temperatureUpdate, { farenheit: (evt as any).target.value }) })
      .class((get) => inputStyling(get(farenheitInvalid), isError(get(farenheitTemperature.meta))))
  })
}

function inputStyling(isInvalid: boolean, isError: boolean): string {
  let classNames = textInputClasses()

  if (isInvalid) {
    classNames = classNames.concat(invalidInputClasses())
  } else if (isError) {
    classNames = classNames.concat(errorInputClasses())
  }

  return names(classNames)
}

function isError(meta: Meta<any, any>): boolean {
  return meta.type === "error"
}

function invalidInputClasses(): Array<string> {
  return [
    "bg-fuchsia-300"
  ]
}

function errorInputClasses(): Array<string> {
  return [
    "bg-slate-300"
  ]
}

function textInputClasses(): Array<string> {
  return [
    "border-2",
    "p-1",
    "m-4"
  ]
}