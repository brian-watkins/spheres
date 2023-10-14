import { batch, container, rule, value, write } from "state-party"

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
  reducer: (update: TemperatureUpdate) => {
    if (update.celsius) return update.celsius

    if (update.farenheit) {
      const farenheitValue = Number(update.farenheit)
      if (Number.isNaN(farenheitValue)) {
        throw new Error("calculation-invalid")
      } else {
        return ((farenheitValue - 32) * (5 / 9)).toFixed(1)
      }
    }

    return ""
  }
})

export const farenheitTemperature = container({
  initialValue: "",
  reducer: (update: TemperatureUpdate) => {
    if (update.farenheit) return update.farenheit

    if (update.celsius) {
      const celsiusValue = Number(update.celsius)
      if (Number.isNaN(celsiusValue)) {
        throw new Error("calculation-invalid")
      } else {
        return (celsiusValue * (9 / 5) + 32).toFixed(1)
      }
    }

    return ""
  }
})

export const farenheitInvalid = value({
  query: (get) => isNaN(Number(get(farenheitTemperature)))
})

export const celsiusInvalid = value({
  query: (get) => isNaN(Number(get(celsiusTemperature)))
})
