import { createStateHandler, getStateHandler, State, StateReader, StateReference, TokenRegistry } from "../tokenRegistry";
import { ConstantReader } from "./handler/constantReader";

export class Constant<T> extends State<T> implements StateReference<T> {
  constructor (name: string | undefined, private value: T) {
    super(name)
  }
  
  [createStateHandler](): StateReader<T> {
    return new ConstantReader(this.value)
  }
  
  [getStateHandler](registry: TokenRegistry): StateReader<T> {
    return registry.getState(this)
  }
}