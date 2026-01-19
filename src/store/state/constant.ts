import { getStateHandler, StateReader, StateReference } from "../tokenRegistry.js";
import { ConstantReader } from "./handler/constantReader.js";

export class Constant<T> extends ConstantReader<T> implements StateReference<T> {
  [getStateHandler](): StateReader<T> {
    return this
  }
}