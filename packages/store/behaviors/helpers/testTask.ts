
export class TestTask<M, E = any> {
  private resolver: ((value: M) => void) | undefined
  private rejector: ((value: E) => void) | undefined

  waitForIt(): Promise<M> {
    return new Promise((resolve, reject) => {
      this.resolver = resolve
      this.rejector = reject
    })
  }

  resolveWith(value: M) {
    this.resolver?.(value)
  }

  rejectWith(error: E) {
    this.rejector?.(error)
  }
}
