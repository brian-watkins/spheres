import { LensState, State } from "./store.js";

export function lens<T>(state: State<T>): Lens<T> {
  return new RootLens(state)
}

export interface Lens<T> {
  andThen<S>(bind: (value: T) => Lens<S>): Lens<S>
  map<S>(mapper: (value: T) => S): Lens<S>
  focus(): State<T>
}

abstract class AbstractLens<T> implements Lens<T> {
  andThen<S>(bind: (value: T) => Lens<S>): Lens<S> {
    const parentState = this.focus()
    return new RootLens(new LensState((get) => bind(get(parentState)).focus(), (value) => value))
  }

  map<S>(mapper: (value: T) => S): Lens<S> {
    const parentState = this.focus()
    return new RootLens(new LensState(() => parentState, mapper))
  }

  abstract focus(): State<T>
}

class RootLens<T> extends AbstractLens<T> {
  constructor(private root: State<T>) {
    super()
  }

  focus(): State<T> {
    return this.root
  }
}