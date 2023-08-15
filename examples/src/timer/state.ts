import { Provider, container, value } from "state-party";

export const elapsedTime = container({ initialValue: 0 })

export const duration = container({ initialValue: 0 })

export const percentComplete = value({
  query: (get) => {
    if (get(duration) === 0) return "0"
    return Math.min(1, get(elapsedTime) / (get(duration) * 1000)).toFixed(2)
  }
})

const timerId = container<any | undefined>({ initialValue: undefined })

const timerShouldRun = value({
  query: (get) => get(duration) > 0 && get(elapsedTime) < (get(duration) * 1000)
})

export const timerProvider: Provider = {
  provide: ({ get, set }) => {
    const timerIsRunning = get(timerId) !== undefined

    if (timerIsRunning && !get(timerShouldRun)) {
      clearInterval(get(timerId))
      set(timerId, undefined)
    } else if (!timerIsRunning && get(timerShouldRun)) {
      const intervalId = setInterval(() => {
        set(elapsedTime, get(elapsedTime) + 100)
      }, 100)
      set(timerId, intervalId)
    }
  }
}