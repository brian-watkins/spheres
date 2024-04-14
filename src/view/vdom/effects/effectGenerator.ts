import { GetState } from "@spheres/store";

export type EffectGenerator<S> = (get: GetState, props: any) => S