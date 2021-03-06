import * as T from "./deps"
import { Managed } from "./managed"
import type { ReleaseMap } from "./releaseMap"
import * as RelMap from "./releaseMap"

/**
 * Lifts a `Effect< R, E, A>` into `Managed< R, E, A>` with no release action. The
 * effect will be performed interruptibly.
 */
export function fromEffect<R, E, A>(effect: T.Effect<R, E, A>) {
  return new Managed<R, E, A>(
    T.map_(
      T.accessM((_: readonly [R, ReleaseMap]) => T.provideAll_(effect, _[0])),
      (a) => [RelMap.noopFinalizer, a]
    )
  )
}
