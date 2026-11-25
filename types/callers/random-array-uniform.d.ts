// @stdlib/random/array/uniform, for tsconfig.callers.json (ticket 0094). stdlib
// declares the result as a union of every array type, whatever the `dtype`.
// At runtime the `dtype` (default 'float64') decides it, so a caller passing
// the result to a routine needs this overload set to be checked at all.
declare function uniform( len: number, a: number, b: number, options?: { dtype?: 'float64' } ): Float64Array;
declare function uniform( len: number, a: number, b: number, options: { dtype: 'float32' } ): Float32Array;
declare function uniform( len: number, a: number, b: number, options: { dtype: 'generic' } ): Array<number>;

export = uniform;
