import { GetState } from "../../../store/index.js";

export type EffectGenerator<S> = (args: any) => (get: GetState) => S