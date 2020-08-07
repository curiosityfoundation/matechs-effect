/**
 * @category definitions
 */

export interface Closure<A> {
  combine(r: A): (l: A) => A
}

export const make = <A>(f: (l: A, r: A) => A): Closure<A> => ({
  combine: (r) => (l) => f(l, r)
})