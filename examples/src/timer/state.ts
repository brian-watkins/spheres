import { Rule, command, container, rule, derived, write } from "spheres/store";

export const elapsedTime = container({ initialValue: 0 })

export const duration = container({ initialValue: 0 })

export const percentComplete = derived({
  query: (get) => {
    if (get(duration) === 0) return "0"
    return Math.min(1, get(elapsedTime) / (get(duration) * 1000)).toFixed(2)
  }
})

export interface RepeaterCommand {
  shouldRun: boolean
  rule: Rule
  interval: number
}

const updateElapsedTimeRule = rule((get) => {
  return write(elapsedTime, Math.min(get(duration) * 1000, get(elapsedTime) + 100))
})

export const runTimerCommand = command<RepeaterCommand>({
  trigger: (get) => {
    return {
      shouldRun: get(duration) > 0 && get(elapsedTime) < (get(duration) * 1000),
      interval: 100,
      rule: updateElapsedTimeRule
    }
  }
})