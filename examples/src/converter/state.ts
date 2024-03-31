import { batch, container, rule, derived, write } from "@spheres/store"

export interface TemperatureUpdate {
  celsius?: string
  farenheit?: string
}

export const temperatureUpdate = rule((_, input: TemperatureUpdate) => {
  return batch([
    write(celsiusTemperature, input),
    write(farenheitTemperature, input)
  ])
})

export const celsiusTemperature = container({
  initialValue: "",
  update: (update: TemperatureUpdate, current) => {
    if (update.celsius) return { value: update.celsius }

    if (update.farenheit) {
      const farenheitValue = Number(update.farenheit)
      if (Number.isNaN(farenheitValue)) {
        return { value: current }
      }

      return { value: ((farenheitValue - 32) * (5 / 9)).toFixed(1) }
    }

    return { value: "" }
  }
})

export const farenheitTemperature = container({
  initialValue: "",
  update: (update: TemperatureUpdate, current) => {
    if (update.farenheit) return { value: update.farenheit }

    if (update.celsius) {
      const celsiusValue = Number(update.celsius)
      if (Number.isNaN(celsiusValue)) {
        return { value: current }
      }

      return { value: (celsiusValue * (9 / 5) + 32).toFixed(1) }
    }

    return { value: "" }
  }
})

export const farenheitInvalid = derived({
  query: (get) => isNaN(Number(get(farenheitTemperature)))
})

export const celsiusInvalid = derived({
  query: (get) => isNaN(Number(get(celsiusTemperature)))
})
