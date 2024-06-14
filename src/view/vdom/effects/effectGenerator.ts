import { GetState } from "../../../store/index.js";

export type EffectGenerator<S> = (get: GetState, props: any) => S