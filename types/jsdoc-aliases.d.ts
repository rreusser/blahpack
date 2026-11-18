// Ambient aliases for the stdlib-js JSDoc type vocabulary, so `tsc --checkJs`
// can read the `@param {Type}` annotations used throughout lib/.
// Loose for now (Complex types are `any`); tighten as the error count ratchets down.

type integer = number;
type NonNegativeInteger = number;
type PositiveInteger = number;
type NonNegativeNumber = number;
type PositiveNumber = number;
type Collection<T = any> = ArrayLike<T>;
type TypedArray = any;
type NumericArray = any;
type ndarray = any;
type Complex128Array = any;
type Complex64Array = any;
type Complex128 = any;
type Complex64 = any;
type BooleanArray = any;
type MatrixTriangle = string;
type Layout = string;
type TransposeOperation = string;
type DiagonalType = string;
type OperationSide = string;

declare var require: any;
declare var module: any;
