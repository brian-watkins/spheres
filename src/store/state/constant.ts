import { getStateHandler, StateReader, StateReference } from "../tokenRegistry";
import { ConstantReader } from "./handler/constantReader";

export class Constant<T> extends ConstantReader<T> implements StateReference<T> {
  [getStateHandler](): StateReader<T> {
    return this
  }
}