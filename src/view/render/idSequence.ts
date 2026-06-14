export class IdSequence {
  private val: number = 0
  private prefix: string

  constructor(prefix?: string) {
    this.prefix = prefix === undefined ? "" : `${prefix}.`
  }

  get next(): string {
    this.val = this.val + 1
    return `${this.prefix}${this.val.toString(36)}`
  }
}
