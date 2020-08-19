import * as P from "../../Prelude"
import * as A from "../Array"

import * as E from "@effect-ts/system/Either"
import { flow, tuple, pipe } from "@effect-ts/system/Function"
import * as R from "@effect-ts/system/Record"

export const RecordURI = "RecordURI"

export type RecordURI = typeof RecordURI

declare module "../../Prelude/HKT" {
  interface URItoKind<N extends string, K, SI, SO, X, I, S, R, E, A> {
    [RecordURI]: R.Record<N, A>
  }
  interface URItoIndex<N extends string, K> {
    [RecordURI]: N
  }
}

export const Covariant = P.instance<P.Covariant<RecordURI>>({
  map: R.map
})

export const foreachF = P.implementForeachF<RecordURI>()((_) => (G) => (f) =>
  foreachWithIndexF(G)((_, a) => f(a))
)

export const Traversable = P.instance<P.Traversable<RecordURI>>({
  map: R.map,
  foreachF
})

export const foreachWithIndexF = P.implementForeachWithIndexF<RecordURI>()(
  (_) => (G) => (f) =>
    flow(
      R.collect(tuple),
      A.foreachF(G)(([k, a]) => G.map((b) => tuple(k, b))(f(k, a))),
      G.map(
        A.reduce({} as R.Record<typeof _.N, typeof _.B>, (b, [k, v]) =>
          Object.assign(b, { [k]: v })
        )
      )
    )
)

export const TraversableWithIndex = P.instance<P.TraversableWithIndex<RecordURI>>({
  map: R.map,
  foreachWithIndexF
})

export const Reduce = P.instance<P.Reduce<RecordURI>>({
  reduce: R.reduce
})

export const ReduceRight = P.instance<P.ReduceRight<RecordURI>>({
  reduceRight: R.reduceRight
})

export const ReduceWithIndex = P.instance<P.ReduceWithIndex<RecordURI>>({
  reduceWithIndex: R.reduceWithIndex
})

export const ReduceRightWithIndex = P.instance<P.ReduceRightWithIndex<RecordURI>>({
  reduceRightWithIndex: R.reduceRightWithIndex
})

export const foldMap: P.FoldMapFn<RecordURI> = (I) => (f) =>
  R.reduce(I.identity, (b, a) => I.combine(f(a))(b))

export const FoldMap = P.instance<P.FoldMap<RecordURI>>({
  foldMap
})

export const Foldable: P.Foldable<RecordURI> = {
  ...FoldMap,
  ...Reduce,
  ...ReduceRight
}

export const toRecord = <K extends string, V>(
  _: A.Array<readonly [K, V]>
): R.Record<K, V> =>
  A.reduce_(_, {} as R.Record<K, V>, (b, [k, v]) => Object.assign(b, { [k]: v }))

export const separateF = P.implementSeparateF<RecordURI>()(() => (G) => (f) =>
  flow(
    R.collect(tuple),
    A.separateF(G)(([k, a]) =>
      pipe(
        f(a),
        G.map(
          E.bimap(
            (b) => tuple(k, b),
            (a) => tuple(k, a)
          )
        )
      )
    ),
    G.map(({ left, right }) => ({ left: toRecord(left), right: toRecord(right) }))
  )
)

export const Wiltable = P.instance<P.Wiltable<RecordURI>>({
  separateF
})

export {
  collect,
  collect_,
  compact,
  deleteAt,
  deleteAt_,
  empty,
  every,
  every_,
  filter,
  filterMap,
  filterMapWithIndex,
  filterMapWithIndex_,
  filterMap_,
  filterWithIndex,
  filterWithIndex_,
  filter_,
  fromMutable,
  hasOwnProperty,
  insertAt,
  insertAt_,
  isEmpty,
  keys,
  lookup,
  lookup_,
  map,
  mapWithIndex,
  mapWithIndex_,
  map_,
  modifyAt,
  modifyAt_,
  partition,
  partitionMap,
  partitionMapWithIndex,
  partitionMapWithIndex_,
  partitionMap_,
  partitionWithIndex,
  partitionWithIndex_,
  partition_,
  pop,
  pop_,
  Record,
  reduce,
  reduceRight,
  reduceRightWithIndex,
  reduceRightWithIndex_,
  reduceRight_,
  reduceWithIndex,
  reduceWithIndex_,
  reduce_,
  separate,
  singleton,
  size,
  some,
  some_,
  toMutable,
  toReadonlyArray,
  updateAt,
  updateAt_
} from "@effect-ts/system/Record"