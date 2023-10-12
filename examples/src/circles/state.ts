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

interface AddCircleMessage {
  type: "add-circle"
  center: Coordinate
  selected: boolean
}

export function addCircleAt(center: Coordinate, selected: boolean = false): AddCircleMessage {
  return {
    type: "add-circle",
    center,
    selected
  }
}

// type CirclesMessage = AddCircleMessage

export const circleData: Container<Array<CircleContainer>> = container({
  initialValue: [],
  // reducer: (message, current: Array<CircleContainer>) => {
    // switch (message.type) {
      // case "add-circle":
        // return [ ...current, circleContainer(message.center, message.selected) ]
    // }
  // }
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

// We could have a container that represents when a circle is capable of
// being adjusted. Although what this really represents is the state of the
// UI -- since it's whether we are opening the window to adjust the diameter
// that this gets set

export const adjustableCircle = container<CircleContainer | undefined>({
  initialValue: undefined
})


// For undo, redo
// one approach would be to have a container with a list of messages
// and then the circleData is a value that depends on this list of messages
// when it changes then it basically rehydrates from this list.
// But there needs to be a pointer to an index in the list as well. And the
// value would need to depend on that as well. When we undo, we decrement
// the pointer. When we redo we increase it. And when we make a significant
// action, we add it at the current index and delete the remaining.
// This seems like a pretty literal approach. Is there another way?

// The problem with the above is that adding circles is easy, but adjusting the
// diameter occurs on a different state object. So you'd somehow need to
// know which circle needs to be adjusted etc.

// I guess there are a few cases.
// 1. Adjusting radius -- this means that the circle must exist and have a previous radius
// undo in this case means the circle goes back to the previous radius
// 2. Adding a circle -- this means that the circle did not exist and undo means remove
// this circle.

// Ok so maybe we have a list of actions like:

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

// And then when you hit undo you get the Action at the current index and call undo() to get
// a message which you process -- this would all be in a selection.
// And to redo, you increase the index, get the action at that index and the return the message
// from the redo function.
// To do a new action, you have a selection that adds at the current index and deletes subsequent
// actions. And then also returns the message from do()
// So to add a circle you would create something like an action
// where do is to send an AddCircle message -- where it refers to a CircleContainer
// and undo is to remove the CircleContainer from the array.
// And to adjust diameter:
// do sends a updateradius message to the circleContainer
// and undo sends a updateReadius message to the previous radius
// So hopefully we create the CircleContainer once, and even if we undo it, we
// still have a reference to it if we have to redo and even adjust the radius again
