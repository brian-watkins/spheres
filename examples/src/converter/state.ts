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
  reducer: (update: TemperatureUpdate, current) => {
    if (update.celsius) return update.celsius

    if (update.farenheit) {
      const farenheitValue = Number(update.farenheit)
      if (Number.isNaN(farenheitValue)) {
        return current
      }

      return ((farenheitValue - 32) * (5 / 9)).toFixed(1)
    }

    return ""
  }
})

export const farenheitTemperature = container({
  initialValue: "",
  reducer: (update: TemperatureUpdate, current) => {
    if (update.farenheit) return update.farenheit

    if (update.celsius) {
      const celsiusValue = Number(update.celsius)
      if (Number.isNaN(celsiusValue)) {
        return current
      }

      return (celsiusValue * (9 / 5) + 32).toFixed(1)
    }

    return ""
  }
})

export const farenheitInvalid = derived({
  query: (get) => isNaN(Number(get(farenheitTemperature)))
})

export const celsiusInvalid = derived({
  query: (get) => isNaN(Number(get(celsiusTemperature)))
})
