// Ambient aliases for the stdlib-js JSDoc type vocabulary, so `tsc --checkJs`
// can read the `@param {Type}` annotations used throughout lib/.
// tsconfig.json runs `strict`. Arrays are stdlib's real types, and option
// vocabularies are literal unions.
// The complex SCALARS are still `any` (ticket 0085). lint/typecheck-config.test.cjs
// pins every tightened alias and strict flag, so neither can be loosened
// without a change to that test.

type integer = number;
type NonNegativeInteger = number;
type PositiveInteger = number;
type NonNegativeNumber = number;
type PositiveNumber = number;
type Collection<T = any> = ArrayLike<T>;
type TypedArray = Float64Array | Float32Array | Int32Array | Uint32Array | Int16Array | Uint16Array | Int8Array | Uint8Array | Uint8ClampedArray;
type NumericArray = TypedArray | Array<number>;
type Complex128Array = import( '@stdlib/types/array' ).Complex128Array;
type Complex64Array = import( '@stdlib/types/array' ).Complex64Array;
type Complex128 = any; // ticket 0085
type Complex64 = any; // ticket 0085
type BooleanArray = Uint8Array | Array<boolean>;
type MatrixTriangle = 'upper' | 'lower';
type Layout = 'row-major' | 'column-major';
type TransposeOperation = 'no-transpose' | 'transpose' | 'conjugate-transpose';
type DiagonalType = 'unit' | 'non-unit';
type OperationSide = 'left' | 'right';

declare var require: any;
declare var module: any;
