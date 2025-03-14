export class IdSequence {
  private val: number = 0

  constructor(private prefix: string = "0") { }

  get next(): string {
    this.val = this.val + 1
    return `${this.prefix}.${this.val.toString(36)}`
  }
}
