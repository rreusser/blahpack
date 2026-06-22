import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import { ndarray as zheconRook } from './../lib/index.js';

// Example: estimate rcond of the 3x3 Hermitian identity (already factored).
var N = 3;
var A = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] ); // eslint-disable-line max-len
var ipiv = new Int32Array( [ 0, 1, 2 ] );
var work = new Complex128Array( 2 * N );
var rcond = new Float64Array( 1 );

zheconRook( 'upper', N, A, 1, N, 0, ipiv, 1, 0, 1.0, rcond, work, 1, 0 );
console.log( rcond[ 0 ] ); // eslint-disable-line no-console
