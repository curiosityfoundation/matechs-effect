import * as T from "../_internal/effect"
import * as M from "../_internal/managed"
import * as C from "../../Cause/core"
import * as Exit from "../../Exit/api"
import { pipe } from "../../Function"
import type { Finalizer, ReleaseMap } from "../../Managed"
import { makeReleaseMap, noopFinalizer, releaseAll } from "../../Managed"
import * as Option from "../../Option"
import * as Ref from "../../Ref"
import type * as Pull from "../Pull"
import { Stream } from "./definitions"

/**
 * Switches over to the stream produced by the provided function in case this one
 * fails. Allows recovery from all causes of failure, including interruption if the
 * stream is uninterruptible.
 */
export const catchAllCause = <E, R1, E2, O1>(
  f: (e: C.Cause<E>) => Stream<R1, E2, O1>
) => <R, O>(self: Stream<R, E, O>): Stream<R & R1, E2, O1 | O> => {
  type NotStarted = { _tag: "NotStarted" }
  type Self<E0> = { _tag: "Self"; pull: Pull.Pull<R, E0, O> }
  type Other = { _tag: "Other"; pull: Pull.Pull<R1, E2, O1> }
  type State<E0> = NotStarted | Self<E0> | Other

  return new Stream<R & R1, E2, O | O1>(
    pipe(
      M.do,
      M.bind(
        "finalizerRef",
        () => M.finalizerRef(noopFinalizer) as M.Managed<R, never, Ref.Ref<Finalizer>>
      ),
      M.bind("ref", () =>
        pipe(
          Ref.makeRef<State<E>>({ _tag: "NotStarted" }),
          T.toManaged()
        )
      ),
      M.let("pull", ({ finalizerRef, ref }) => {
        const closeCurrent = (cause: C.Cause<any>) =>
          pipe(
            finalizerRef,
            Ref.getAndSet(noopFinalizer),
            T.chain((f) => f(Exit.halt(cause))),
            T.uninterruptible
          )

        const open = <R, E0, O>(stream: Stream<R, E0, O>) => (
          asState: (_: Pull.Pull<R, E0, O>) => State<E>
        ) =>
          T.uninterruptibleMask(({ restore }) =>
            pipe(
              makeReleaseMap,
              T.chain((releaseMap) =>
                pipe(
                  finalizerRef.set((exit) =>
                    releaseAll(exit, T.sequential)(releaseMap)
                  ),
                  T.chain(() =>
                    pipe(
                      restore(stream.proc.effect),
                      T.provideSome((_: R) => [_, releaseMap] as [R, ReleaseMap]),
                      T.map(([_, __]) => __),
                      T.tap((pull) => ref.set(asState(pull)))
                    )
                  )
                )
              )
            )
          )

        const failover = (cause: C.Cause<Option.Option<E>>) =>
          pipe(
            cause,
            C.sequenceCauseOption,
            Option.fold(
              () => T.fail(Option.none),
              (cause) =>
                pipe(
                  closeCurrent(cause),
                  T.chain(() =>
                    open(f(cause))((pull) => ({
                      _tag: "Other",
                      pull
                    }))
                  ),
                  T.flatten
                )
            )
          )

        return pipe(
          ref.get,
          T.chain((s) => {
            switch (s._tag) {
              case "NotStarted": {
                return pipe(
                  open(self)((pull) => ({ _tag: "Self", pull })),
                  T.flatten,
                  T.catchAllCause(failover)
                )
              }
              case "Self": {
                return pipe(s.pull, T.catchAllCause(failover))
              }
              case "Other": {
                return s.pull
              }
            }
          })
        )
      }),
      M.map(({ pull }) => pull)
    )
  )
}
