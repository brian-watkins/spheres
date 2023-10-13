import { Container, StoreMessage, batch, container, selection, value, write } from "state-party";

export interface Coordinate {
  x: number
  y: number
}

export interface Circle {
  center: Coordinate
  radius: number
  selected: boolean
}

export const circleData: Container<Array<CircleContainer>> = container({
  initialValue: [],
})

export interface CircleSelectionMessage {
  type: "circle-selection"
  selected: boolean
}

export function selectCircle(): CircleSelectionMessage {
  return {
    type: "circle-selection",
    selected: true
  }
}

export function deselectCircle(): CircleSelectionMessage {
  return {
    type: "circle-selection",
    selected: false
  }
}

export interface CircleAdjustRadiusMessage {
  type: "circle-adjust-radius"
  radius: number
}

export function adjustRadius(radius: number): CircleAdjustRadiusMessage {
  return {
    type: "circle-adjust-radius",
    radius
  }
}

export type CircleMessage = CircleSelectionMessage | CircleAdjustRadiusMessage

export type CircleContainer = Container<Circle, CircleMessage>

function circleContainer(center: Coordinate, selected: boolean): CircleContainer {
  return container({
    initialValue: { center, radius: 20, selected },
    name: `Circle at (${center.x},${center.y})`,
    reducer: (message, current: Circle) => {
      switch (message.type) {
        case "circle-selection":
          return { ...current, selected: message.selected }
        case "circle-adjust-radius":
          return { ...current, radius: message.radius }
      }
    }
  })
}

interface Action {
  execute: StoreMessage<any>
  undo: StoreMessage<any>
}

const actions = container<Array<Action>>({
  initialValue: []
})

export const currentAction = container({ initialValue: -1 })

export const addCircleSelection = selection((get, center: Coordinate) => {
  const circle = circleContainer(center, true)

  const currentCircles = get(circleData)

  const addCircleAction = {
    execute: write(circleData, [...currentCircles, circle]),
    undo: write(circleData, currentCircles)
  }

  const actionIndex = get(currentAction)
  const currentActions = get(actions)

  return batch([
    write(actions, [...currentActions.slice(0, actionIndex + 1), addCircleAction]),
    write(currentAction, actionIndex + 1),
    addCircleAction.execute
  ])
})

export interface AdjustmentOptions {
  circle: CircleContainer
  originalRadius: number
}

export const adjustRadiusSelection = selection((get, options: AdjustmentOptions) => {
  const currentRadius = get(options.circle).radius

  if (currentRadius === options.originalRadius) {
    return batch([])
  }

  const adjustRadiusAction = {
    execute: write(options.circle, adjustRadius(currentRadius)),
    undo: write(options.circle, adjustRadius(options.originalRadius))
  }

  const actionIndex = get(currentAction)
  const currentActions = get(actions)

  return batch([
    write(actions, [...currentActions.slice(0, actionIndex + 1), adjustRadiusAction]),
    write(currentAction, actionIndex + 1),
    adjustRadiusAction.execute
  ])
})

export const undoSelection = selection(get => {
  const actionIndex = get(currentAction)
  const action = get(actions)[actionIndex]

  return batch([
    action.undo,
    write(currentAction, actionIndex - 1)
  ])
})

export const redoSelection = selection(get => {
  const actionIndex = get(currentAction)
  const action = get(actions)[actionIndex + 1]

  return batch([
    action.execute,
    write(currentAction, actionIndex + 1)
  ])
})

export const canUndo = value({
  query: (get) => get(currentAction) > -1
})

export const canRedo = value({
  query: (get) => get(currentAction) !== get(actions).length - 1
})
