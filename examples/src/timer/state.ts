import { Provider, container, value } from "@spheres/store";

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

export type RepeaterId = any

export interface Repeater {
  repeatEvery(run: () => void, millis: number): RepeaterId
  cancel(systemTimerId: RepeaterId): void
}

export const timerProvider = (repeater: Repeater): Provider => {
  return {
    provide: ({ get, set }) => {
      const timerIsRunning = get(timerId) !== undefined

      if (timerIsRunning && !get(timerShouldRun)) {
        repeater.cancel(get(timerId))
        set(timerId, undefined)
      } else if (!timerIsRunning && get(timerShouldRun)) {
        const intervalId = repeater.repeatEvery(() => {
          set(elapsedTime, get(elapsedTime) + 100)
        }, 100)
        set(timerId, intervalId)
      }
    }
  }
}