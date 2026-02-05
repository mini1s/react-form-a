export type Settings = {
    activeColor?: string
    activeTextColor?: string
    activeBorderColor?: string
    inactiveColor?: string
    inactiveTextColor?: string
    inactiveBorderColor?: string
}

type Primitive = string | number | boolean | bigint | symbol | null | undefined

export type DotPaths<T> = T extends Primitive
    ? never
    : {
          [K in keyof T]-?: K extends string
              ? T[K] extends Array<infer U>
                  ? `${K}` | `${K}.${number}` | `${K}.${number}.${DotPaths<U>}`
                  : T[K] extends object
                    ? `${K}` | `${K}.${DotPaths<T[K]>}`
                    : `${K}`
              : never
      }[keyof T]

type Split<S extends string> = S extends `${infer A}.${infer B}` ? [A, ...Split<B>] : [S]

export type PathValue<T, P extends string> = PathValueParts<T, Split<P>>

type PathValueParts<T, Parts extends any[]> = Parts extends [infer Head, ...infer Tail]
    ? Head extends `${number}`
        ? T extends Array<infer U>
            ? Tail extends []
                ? U
                : PathValueParts<U, Tail>
            : never // indexing non-array
        : Head extends keyof T
          ? Tail extends []
              ? T[Head]
              : PathValueParts<T[Head], Tail>
          : never // invalid key
    : T // no parts left

export type GetValue<F extends object> = <P extends DotPaths<F>>(path: P) => PathValue<F, P> | undefined
export type SetValue<F extends object> = <P extends DotPaths<F>>(path: P, value: PathValue<F, P>) => void

export type ChildKey<F extends object, P extends string> =
    PathValue<F, P> extends Array<infer U> ? keyof U & string : PathValue<F, P> extends object ? keyof PathValue<F, P> & string : never

export type FullPath<F extends object, PParent extends DotPaths<F>> = `${PParent}.${ChildKey<F, PParent>}`
export type SpecificFullPath<F extends object, PParent extends DotPaths<F>, PChild extends ChildKey<F, PParent>> = `${PParent}.${PChild}`
