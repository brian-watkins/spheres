import { View, view } from "display-party";
import { GetState, store } from "state-party";
import { celsiusInvalid, celsiusTemperature, farenheitInvalid, farenheitTemperature, temperatureUpdate } from "./state.js";


export function converter(): View {
  return view().main(el => {
    el.children
      .div(el => {
        el.children
          .label(el => {
            el.config.for("celsius")
            el.children.text("Celsius")
          })
          .withState({
            view: celsiusInput
          })
      })
      .div(el => {
        el.children
          .label(el => {
            el.config.for("farenheit")
            el.children.text("Farenheit")
          })
          .withState({
            view: farenheitInput
          })
      })
  })
}

function celsiusInput(get: GetState): View {
  return view().input(el => {
    let classNames = textInputClasses()

    if (get(celsiusInvalid)) {
      classNames = classNames.concat(invalidInputClasses())
    } else if (get(celsiusTemperature.meta).type === "error") {
      classNames = classNames.concat(errorInputClasses())
    }

    el.config
      .id("celsius")
      .type("text")
      .value(get(celsiusTemperature))
      .on({ input: (evt) => store(temperatureUpdate, { celsius: (evt as any).target.value }) })
      .classes(classNames)
  })
}

function farenheitInput(get: GetState): View {
  return view().input(el => {
    let classNames = textInputClasses()

    if (get(farenheitInvalid)) {
      classNames = classNames.concat(invalidInputClasses())
    } else if (get(farenheitTemperature.meta).type === "error") {
      classNames = classNames.concat(errorInputClasses())
    }

    el.config
      .id("farenheit")
      .type("text")
      .value(get(farenheitTemperature))
      .on({ input: (evt) => store(temperatureUpdate, { farenheit: (evt as any).target.value }) })
      .classes(classNames)
  })
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