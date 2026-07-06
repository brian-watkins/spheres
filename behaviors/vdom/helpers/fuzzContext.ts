import { Context } from "best-behavior";

type RandomNumberGenerator = () => number

function mulberry32(seed: number): RandomNumberGenerator {
  let a = seed
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0
    let t = Math.imul(a ^ a >>> 15, 1 | a)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

class RandomNumberSource {
  constructor(private generator: RandomNumberGenerator) { }

  randomInt(maxExclusive: number): number {
    return Math.floor(this.generator() * maxExclusive)
  }
}

export interface FuzzState<T> {
  current: T
}

export interface Mutation<T, X extends FuzzState<T>> {
  name: string
  apply(state: X, randomNumberSource: RandomNumberSource): X
}

export interface FuzzerConfig<T, X extends FuzzState<T>> {
  seed: number
  initialState: (source: RandomNumberSource) => X
  mutations: Array<Mutation<T, X>>
}

export function fuzzContext<T, X extends FuzzState<T>>(config: FuzzerConfig<T, X>): Context<Fuzzer<T, X>> {
  return {
    init: () => new Fuzzer(config)
  }
}

class Fuzzer<T, X extends FuzzState<T>> {
  private source: RandomNumberSource
  private mutations: Array<Mutation<T, X>>
  private performedMutations: Array<Mutation<T, X>> = []
  private state: X

  constructor(config: FuzzerConfig<T, X>) {
    this.source = new RandomNumberSource(mulberry32(config.seed))
    this.state = config.initialState(this.source)
    this.mutations = config.mutations
  }

  get current(): T {
    return this.state.current
  }

  get next(): T {
    const mutation = this.mutations[this.source.randomInt(this.mutations.length)]
    this.state = mutation.apply(this.state, this.source)
    this.performedMutations.push(mutation)
    return this.state.current
  }

  get lastMutation() {
    return this.performedMutations[this.performedMutations.length - 1]
  }
}