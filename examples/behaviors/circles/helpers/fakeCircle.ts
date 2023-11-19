import { Circle, Coordinate } from "../../../src/circles/state";

export class FakeCircle implements Circle {
  constructor (public center: Coordinate, public radius: number, public selected: boolean) { }
}

export function testCircle(x: number, y: number): FakeCircle {
  return new FakeCircle({ x, y }, 20, false)
}