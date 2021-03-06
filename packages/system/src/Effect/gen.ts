/**
 * inspired by https://github.com/tusharmath/qio/pull/22 (revised)
 */
import type { Either } from "../Either"
import { tuple } from "../Function"
import type { NoSuchElementException } from "../GlobalExceptions"
import type { Has, Tag } from "../Has"
import type { ReleaseMap } from "../Managed"
import { makeReleaseMap, Managed, releaseAll } from "../Managed"
import type { Option } from "../Option"
import type { _E, _R } from "../Utils"
import { isEither, isOption, isTag } from "../Utils"
import { bracketExit_ } from "./bracketExit_"
import { chain_, succeed, suspend, unit } from "./core"
import type { Effect } from "./effect"
import { sequential } from "./ExecutionStrategy"
import { fail } from "./fail"
import { fromEither } from "./fromEither"
import { getOrFail } from "./getOrFail"
import { readService } from "./has"
import { map_ } from "./map_"
import { provideSome_ } from "./provideSome"

export class GenEffect<R, E, A> {
  readonly _R!: (_R: R) => void
  readonly _E!: () => E
  readonly _A!: () => A

  constructor(readonly effect: Effect<R, E, A> | Managed<R, E, A>) {}

  *[Symbol.iterator](): Generator<GenEffect<R, E, A>, A, any> {
    return yield this
  }
}

const adapter = (_: any, __?: any) => {
  if (isEither(_)) {
    return new GenEffect(fromEither(() => _))
  }
  if (isOption(_)) {
    return new GenEffect(
      __ ? (_._tag === "None" ? fail(__()) : succeed(_.value)) : getOrFail(_)
    )
  }
  if (isTag(_)) {
    return new GenEffect(readService(_))
  }
  return new GenEffect(_)
}

export function gen<RBase, EBase, AEff>(): <Eff extends GenEffect<RBase, EBase, any>>(
  f: (i: {
    <A>(_: Tag<A>): GenEffect<Has<A>, never, A>
    <E, A>(_: Option<A>, onNone: () => E): GenEffect<unknown, E, A>
    <A>(_: Option<A>): GenEffect<unknown, NoSuchElementException, A>
    <E, A>(_: Either<E, A>): GenEffect<unknown, E, A>
    <R, E, A>(_: Effect<R, E, A>): GenEffect<R, E, A>
    <R, E, A>(_: Managed<R, E, A>): GenEffect<R, E, A>
  }) => Generator<Eff, AEff, any>
) => Effect<_R<Eff>, _E<Eff>, AEff>
export function gen<EBase, AEff>(): <Eff extends GenEffect<any, EBase, any>>(
  f: (i: {
    <A>(_: Tag<A>): GenEffect<Has<A>, never, A>
    <E, A>(_: Option<A>, onNone: () => E): GenEffect<unknown, E, A>
    <A>(_: Option<A>): GenEffect<unknown, NoSuchElementException, A>
    <E, A>(_: Either<E, A>): GenEffect<unknown, E, A>
    <R, E, A>(_: Effect<R, E, A>): GenEffect<R, E, A>
    <R, E, A>(_: Managed<R, E, A>): GenEffect<R, E, A>
  }) => Generator<Eff, AEff, any>
) => Effect<_R<Eff>, _E<Eff>, AEff>
export function gen<AEff>(): <Eff extends GenEffect<any, any, any>>(
  f: (i: {
    <A>(_: Tag<A>): GenEffect<Has<A>, never, A>
    <E, A>(_: Option<A>, onNone: () => E): GenEffect<unknown, E, A>
    <A>(_: Option<A>): GenEffect<unknown, NoSuchElementException, A>
    <E, A>(_: Either<E, A>): GenEffect<unknown, E, A>
    <R, E, A>(_: Effect<R, E, A>): GenEffect<R, E, A>
    <R, E, A>(_: Managed<R, E, A>): GenEffect<R, E, A>
  }) => Generator<Eff, AEff, any>
) => Effect<_R<Eff>, _E<Eff>, AEff>
export function gen<Eff extends GenEffect<any, any, any>, AEff>(
  f: (i: {
    <A>(_: Tag<A>): GenEffect<Has<A>, never, A>
    <E, A>(_: Option<A>, onNone: () => E): GenEffect<unknown, E, A>
    <A>(_: Option<A>): GenEffect<unknown, NoSuchElementException, A>
    <E, A>(_: Either<E, A>): GenEffect<unknown, E, A>
    <R, E, A>(_: Effect<R, E, A>): GenEffect<R, E, A>
    <R, E, A>(_: Managed<R, E, A>): GenEffect<R, E, A>
  }) => Generator<Eff, AEff, any>
): Effect<_R<Eff>, _E<Eff>, AEff>
export function gen(...args: any[]): any {
  function gen_<Eff extends GenEffect<any, any, any>, AEff>(
    f: (i: any) => Generator<Eff, AEff, any>
  ): Effect<_R<Eff>, _E<Eff>, AEff> {
    return suspend(() => {
      const iterator = f(adapter as any)
      const state = iterator.next()

      function run(
        rm: ReleaseMap,
        state: IteratorYieldResult<Eff> | IteratorReturnResult<AEff>
      ): Effect<any, any, AEff> {
        if (state.done) {
          return succeed(state.value)
        }
        return chain_(
          state.value["effect"] instanceof Managed
            ? map_(
                provideSome_(state.value["effect"]["effect"], (r0) => tuple(r0, rm)),
                ([_, a]) => a
              )
            : state.value["effect"],
          (val) => {
            const next = iterator.next(val)
            return run(rm, next)
          }
        )
      }

      return chain_(makeReleaseMap, (rm) =>
        bracketExit_(
          unit,
          () => run(rm, state),
          (_, e) => releaseAll(e, sequential)(rm)
        )
      )
    })
  }

  if (args.length === 0) {
    return (f: any) => gen_(f)
  }
  return gen_(args[0])
}

export function genA<AEff>() {
  return <Eff extends GenEffect<any, any, any>>(
    f: (i: {
      <A>(_: Tag<A>): GenEffect<Has<A>, never, A>
      <E, A>(_: Option<A>, onNone: () => E): GenEffect<unknown, E, A>
      <A>(_: Option<A>): GenEffect<unknown, NoSuchElementException, A>
      <E, A>(_: Either<E, A>): GenEffect<unknown, E, A>
      <R, E, A>(_: Effect<R, E, A>): GenEffect<R, E, A>
      <R, E, A>(_: Managed<R, E, A>): GenEffect<R, E, A>
    }) => Generator<Eff, AEff, any>
  ): Effect<_R<Eff>, _E<Eff>, AEff> => gen(f)
}
