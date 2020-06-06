import { circularDeepEqual } from "fast-equals"

import { memo } from "../../utils"
import { eqApplyConfig } from "../config"
import { EqType, EqURI } from "../hkt"

import type { Eq } from "@matechs/core/Eq"
import type { AnyEnv } from "@matechs/morphic-alg/config"
import type { MatechsAlgebraUnknown1 } from "@matechs/morphic-alg/unknown"

export interface CustomizeUnknown<RC> {
  compare: "default-circular" | "default-non-circular" | ((env: RC) => Eq<unknown>)
}

declare module "@matechs/morphic-alg/unknown" {
  interface UnknownConfig {
    [EqURI]: {
      eq: Eq<unknown>
    }
  }
}

export const eqUnknownInterpreter = memo(
  <Env extends AnyEnv>(): MatechsAlgebraUnknown1<EqURI, Env> => ({
    _F: EqURI,
    unknown: (cfg) => (env) => {
      const config = eqApplyConfig(cfg)
      return new EqType(
        config === undefined
          ? { equals: circularDeepEqual }
          : config({ equals: circularDeepEqual }, env, {
              eq: { equals: circularDeepEqual }
            })
      )
    }
  })
)