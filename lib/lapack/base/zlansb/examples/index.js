import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlansb from './../lib/index.js';

// Upper complex symmetric 4x4 band matrix with K=1 (bandwidth 1):

// Full symmetric matrix (A(i,j) = A(j,i), NO conjugation):

//   [ (2+1i)    (-3+1i)   0         0       ]

//   [ (-3+1i)   (4-2i)    (1+2i)    0       ]

//   [ 0         (1+2i)    (-5+1i)   (6-3i)  ]

//   [ 0         0         (6-3i)    (7+2i)  ]

// Band storage (column-major, LDAB=2):

//   [ *          (-3+1i)    (1+2i)     (6-3i) ]  <- superdiag

//   [ (2+1i)     (4-2i)     (-5+1i)    (7+2i) ]  <- diagonal
var AB = new Complex128Array( [ 0, 0, 2, 1, -3, 1, 4, -2, 1, 2, -5, 1, 6, -3, 7, 2 ] );
var WORK = new Float64Array( 4 );

console.log( 'Max norm:', zlansb.ndarray( 'max', 'upper', 4, 1, AB, 1, 2, 0, WORK, 1, 0 ) );
console.log( 'One norm:', zlansb.ndarray( 'one-norm', 'upper', 4, 1, AB, 1, 2, 0, WORK, 1, 0 ) );
console.log( 'Inf norm:', zlansb.ndarray( 'inf-norm', 'upper', 4, 1, AB, 1, 2, 0, WORK, 1, 0 ) );
console.log( 'Frobenius norm:', zlansb.ndarray( 'frobenius', 'upper', 4, 1, AB, 1, 2, 0, WORK, 1, 0 ) );
