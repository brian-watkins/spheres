import { getStateHandler, StateReader, StateReference } from "../tokenRegistry.js";
import { Publisher } from "./handler/publisher.js";

export class Value<T> extends Publisher<T> implements StateReference<T> {

  [getStateHandler](): StateReader<T> {
    return this
  }

}