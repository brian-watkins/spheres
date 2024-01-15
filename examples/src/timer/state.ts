import { Rule, command, container, rule, value, write } from "@spheres/store";

export const elapsedTime = container({
  initialValue: 0,
  query: ({ get, current }, next) => {
    return Math.min(get(duration) * 1000, next ?? current)
  }
})

export const duration = container({ initialValue: 0 })

export const percentComplete = value({
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

export const runTimerCommand = command<RepeaterCommand>({
  query: (get) => {
    return {
      shouldRun: get(duration) > 0 && get(elapsedTime) < (get(duration) * 1000),
      interval: 100,
      rule: rule((get) => write(elapsedTime, get(elapsedTime) + 100))
    }
  }
})