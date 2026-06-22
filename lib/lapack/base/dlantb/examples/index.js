import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlantb from './../lib/index.js';

// Upper triangular 4x4 band matrix with K=1 (bandwidth 1):

// Full matrix:

//   [ 2  -3   0   0 ]

//   [ 0   4   1   0 ]

//   [ 0   0  -5   6 ]

//   [ 0   0   0   7 ]

// Band storage (column-major, LDAB=2):

//   [ *   -3    1    6 ]  <- superdiag

//   [ 2    4   -5    7 ]  <- diagonal
var AB = new Float64Array( [ 0, 2, -3, 4, 1, -5, 6, 7 ] );
var WORK = new Float64Array( 4 );

console.log( 'Max norm:', dlantb.ndarray( 'max', 'upper', 'non-unit', 4, 1, AB, 1, 2, 0, WORK, 1, 0 ) );
console.log( 'One norm:', dlantb.ndarray( 'one-norm', 'upper', 'non-unit', 4, 1, AB, 1, 2, 0, WORK, 1, 0 ) );
console.log( 'Inf norm:', dlantb.ndarray( 'inf-norm', 'upper', 'non-unit', 4, 1, AB, 1, 2, 0, WORK, 1, 0 ) );
console.log( 'Frobenius norm:', dlantb.ndarray( 'frobenius', 'upper', 'non-unit', 4, 1, AB, 1, 2, 0, WORK, 1, 0 ) );
