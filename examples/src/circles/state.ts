import { Container, GetState, StoreMessage, batch, container, rule, derived, write } from "@spheres/store";

export interface Coordinate {
  x: number
  y: number
}

export interface Circle {
  center: Coordinate
  radius: number
  selected: boolean
}

export const circleData = container<Array<CircleContainer>>({
  initialValue: []
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

function circleContainer(center: Coordinate): CircleContainer {
  return container({
    initialValue: { center, radius: 20, selected: true },
    name: `Circle at (${center.x},${center.y})`,
    update: (message, current: Circle) => {
      switch (message.type) {
        case "circle-selection":
          return {
            value: { ...current, selected: message.selected }
          }
        case "circle-adjust-radius":
          return {
            value: { ...current, radius: message.radius }
          }
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

function addActionMessage(get: GetState, message: Action): StoreMessage<any> {
  const actionIndex = get(currentAction)
  const currentActions = get(actions)

  return batch([
    write(actions, [...currentActions.slice(0, actionIndex + 1), message]),
    write(currentAction, actionIndex + 1),
    message.execute
  ])
}

export const addCircleRule = rule((get, center: Coordinate) => {
  const currentCircles = get(circleData)

  const addCircleAction = {
    execute: write(circleData, [...currentCircles, circleContainer(center)]),
    undo: write(circleData, currentCircles)
  }

  return addActionMessage(get, addCircleAction)
})

export interface AdjustmentOptions {
  circle: CircleContainer
  originalRadius: number
}

export const adjustRadiusRule = rule((get, options: AdjustmentOptions) => {
  const currentRadius = get(options.circle).radius

  if (currentRadius === options.originalRadius) {
    return batch([])
  }

  const adjustRadiusAction = {
    execute: write(options.circle, adjustRadius(currentRadius)),
    undo: write(options.circle, adjustRadius(options.originalRadius))
  }

  return addActionMessage(get, adjustRadiusAction)
})

export const undoRule = rule(get => {
  const actionIndex = get(currentAction)
  const action = get(actions)[actionIndex]

  return batch([
    action.undo,
    write(currentAction, actionIndex - 1)
  ])
})

export const redoRule = rule(get => {
  const actionIndex = get(currentAction)
  const action = get(actions)[actionIndex + 1]

  return batch([
    action.execute,
    write(currentAction, actionIndex + 1)
  ])
})

export const canUndo = derived({
  query: (get) => get(currentAction) > -1
})

export const canRedo = derived({
  query: (get) => get(currentAction) !== get(actions).length - 1
})
