
export interface ResultHandler<T, E, X> {
  ok(val: T): X
  err(error: E): X
}

export class Result<T, E = undefined> {
  static ok<T, E>(value: T): Result<T, E> {
    return new Result(new Ok(value))
  }

  static err<T, E>(error: E): Result<T, E> {
    return new Result(new Err(error))
  }

  static all<T, E>(...results: Array<Result<T, E>>): Result<Array<T>, E> {
    let values: Array<T> = []
    for (const result of results) {
      switch (result.impl.type) {
        case "error-result":
          return Result.err(result.impl.error)
        case "ok-result":
          values.push(result.impl.value)
          break
      }
    }
    return Result.ok(values)
  }

  private constructor(private impl: Ok<T, E> | Err<T, E>) { }

  get isOk(): boolean {
    return this.impl.isOk
  }

  get isErr(): boolean {
    return !this.impl.isOk
  }

  map<S>(mapper: (value: T) => S): Result<S, E> {
    return this.impl.map(mapper)
  }

  mapError<X>(mapper: (error: E) => X): Result<T, X> {
    return this.impl.mapError(mapper)
  }

  andThen<S>(bind: (value: T) => Result<S, E>): Result<S, E> {
    return this.impl.andThen(bind)
  }

  withDefault(defaultValue: T): T {
    if (this.impl.type === "ok-result") {
      return this.impl.value
    } else {
      return defaultValue
    }
  }

  resolve<X>(handler: ResultHandler<T, E, X>): X {
    return this.impl.resolve(handler)
  }
}

class Ok<T, E> {
  type: "ok-result" = "ok-result"
  
  constructor(readonly value: T) { }

  get isOk(): boolean {
    return true
  }

  map<S>(mapper: (value: T) => S): Result<S, E> {
    return Result.ok(mapper(this.value))
  }

  mapError<X>(_: (error: E) => X): Result<T, X> {
    return Result.ok(this.value)
  }

  andThen<S>(bind: (value: T) => Result<S, E>): Result<S, E> {
    return bind(this.value)
  }

  resolve<X>(handler: ResultHandler<T, E, X>): X {
    return handler.ok(this.value)
  }
}

export class Err<T, E> {
  type: "error-result" = "error-result"
  
  constructor(readonly error: E) { }

  get isOk(): boolean {
    return false
  }

  map<S>(_: (value: T) => S): Result<S, E> {
    return Result.err(this.error)
  }

  mapError<X>(mapper: (error: E) => X): Result<T, X> {
    return Result.err(mapper(this.error))
  }

  andThen<S>(_: (value: T) => Result<S, E>): Result<S, E> {
    return Result.err(this.error)
  }

  resolve<X>(handler: ResultHandler<T, E, X>): X {
    return handler.err(this.error)
  }
}
