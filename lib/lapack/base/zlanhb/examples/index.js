import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlanhb from './../lib/index.js';

// Upper Hermitian 4x4 band matrix with K=1 (bandwidth 1):

// Full Hermitian matrix:

//   [ 2        (-3+1i)   0        0       ]

//   [ (-3-1i)   4        (1+2i)   0       ]

//   [ 0        (1-2i)   -5        (6-3i)  ]

//   [ 0         0       (6+3i)    7       ]

// Band storage (column-major, LDAB=2):

//   [ *          (-3+1i)    (1+2i)     (6-3i) ]  <- superdiag

//   [ (2,0)      (4,0)      (-5,0)     (7,0)  ]  <- diagonal
var AB = new Complex128Array( [ 0, 0, 2, 0, -3, 1, 4, 0, 1, 2, -5, 0, 6, -3, 7, 0 ] );
var WORK = new Float64Array( 4 );

console.log( 'Max norm:', zlanhb.ndarray( 'max', 'upper', 4, 1, AB, 1, 2, 0, WORK, 1, 0 ) );
console.log( 'One norm:', zlanhb.ndarray( 'one-norm', 'upper', 4, 1, AB, 1, 2, 0, WORK, 1, 0 ) );
console.log( 'Inf norm:', zlanhb.ndarray( 'inf-norm', 'upper', 4, 1, AB, 1, 2, 0, WORK, 1, 0 ) );
console.log( 'Frobenius norm:', zlanhb.ndarray( 'frobenius', 'upper', 4, 1, AB, 1, 2, 0, WORK, 1, 0 ) );
