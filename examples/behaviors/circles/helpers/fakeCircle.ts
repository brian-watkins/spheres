import { Coordinate } from "../../../src/circles/state";

export class FakeCircle {
  constructor (public center: Coordinate, public radius: number) { }
}

export function testCircle(x: number, y: number): FakeCircle {
  return new FakeCircle({ x, y }, 20)
}