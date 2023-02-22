import { Container, LoopMessage } from "../loop"
import { ContainerInitializer, writeMessage } from "../index.js"

export interface Collection<T> {
  items: Array<T>
}

export function withCollection<T>(): ContainerInitializer<Collection<T>, CollectionMessage<T>> {
  return {
    initialize: (loop) => {
      return loop.createContainer(emptyCollection(), (message, current) => {
        switch (message.type) {
          case "insert":
            return {
              items: [ ...current.items, message.value ]
            }
        }
      })
    }
  }
}

export function emptyCollection<T>(): Collection<T> {
  return {
    items: []
  }
}

export interface InsertMessage<T> {
  type: "insert"
  value: T
}

export type CollectionMessage<T> = InsertMessage<T>

export function insertMessage<T>(collection: Container<Collection<T>, CollectionMessage<T>>, item: T): LoopMessage<Collection<T>, CollectionMessage<T>> {
  return writeMessage(collection, {
    type: "insert",
    value: item
  })
}