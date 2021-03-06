/**
 * Inspired by https://github.com/gcanti/fp-ts/blob/master/src/HKT.ts
 */

export {
  castEnv,
  castErr,
  castIn,
  castK,
  castS,
  castSI,
  castSO,
  castSt,
  castX
} from "./cast"
export { AnyHKT, HKTTypeS, HKTTypeSI, HKTTypeSO } from "./extract"
export {
  HKT,
  HKT2,
  HKT3,
  HKT4,
  HKT5,
  HKT6,
  HKT7,
  HKT8,
  HKT9,
  HKTFull,
  HKT_,
  HKT3_,
  HKTFull_
} from "./hkt"
export {
  InferEnvF,
  InferEnvK,
  InferErrF,
  InferErrK,
  InferInF,
  InferInK,
  InferKF,
  InferKK,
  InferNKF,
  InferNKK,
  InferOutF,
  InferOutK,
  InferXF,
  InferXK,
  OrNever
} from "./infer"
export { KeyFor, URItoKeys } from "./keys"
export { ErrFor, URItoErr } from "./error"
export {
  Kind,
  Kind2,
  Kind3,
  Kind4,
  Kind5,
  Kind6,
  Kind7,
  Kind8,
  Kind9,
  KindFull
} from "./kind"
export { URIS, URItoKind } from "./registry"
export { Liebenitz } from "./liebenitz"
export { instance } from "./instance"

/**
 * Used to require URI in typeclasses
 */
export interface HasURI<F, TL0 = any, TL1 = any, TL2 = any, TL3 = any> {
  readonly URI: F
  readonly TL0: TL0
  readonly TL1: TL1
  readonly TL2: TL2
  readonly TL3: TL3
}

/**
 * Require additional E constrained
 */
export interface HasE<E> {
  readonly _E: E
}
