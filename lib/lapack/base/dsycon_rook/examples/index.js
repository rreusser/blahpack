import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import { ndarray as dsyconRook } from './../lib/index.js';

// Example: estimate rcond of the 3x3 matrix

//   [ 4  1  1 ]

//   [ 1  3  1 ]

//   [ 1  1  2 ]

// Already factorized in place by dsytrf_rook (1x1 pivots, identity perm).
const N = 3;
const A = new Float64Array( [ 3.4, 1.0, 1.0, 0.2, 2.5, 1.0, 0.5, 0.5, 2.0 ] );
const ipiv = new Int32Array( [ 0, 1, 2 ] );
const work = new Float64Array( 2 * N );
const iwork = new Int32Array( N );
const rcond = new Float64Array( 1 );
const anorm = 6.0;

dsyconRook( 'upper', N, A, 1, N, 0, ipiv, 1, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
console.log( rcond[ 0 ] ); // eslint-disable-line no-console
