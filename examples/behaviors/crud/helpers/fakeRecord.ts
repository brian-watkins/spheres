import { DataRecord } from "../../../src/crud/state.js";

export class FakeDataRecord implements DataRecord {
  constructor(public firstName: string, public lastName: string) { }

  asDisplayed(): string {
    return `${this.lastName}, ${this.firstName}`
  }
}

export function testRecord(firstName: string, lastName: string): FakeDataRecord {
  return new FakeDataRecord(firstName, lastName)
}