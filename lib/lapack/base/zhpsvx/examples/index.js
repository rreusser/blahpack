import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhpsvx from './../lib/index.js';

// 3x3 Hermitian matrix in upper packed storage:
// A = [ 4    1+2i  2-i  ]
//     [ 1-2i 5     3+i  ]
//     [ 2+i  3-i   6    ]
// Upper packed (col-major): A(1,1), A(1,2), A(2,2), A(1,3), A(2,3), A(3,3)
var AP = new Complex128Array( 6 );
var apv = reinterpret( AP, 0 );
apv[ 0 ] = 4.0; apv[ 1 ] = 0.0;   // A(1,1)
apv[ 2 ] = 1.0; apv[ 3 ] = 2.0;   // A(1,2)
apv[ 4 ] = 5.0; apv[ 5 ] = 0.0;   // A(2,2)
apv[ 6 ] = 2.0; apv[ 7 ] = -1.0;  // A(1,3)
apv[ 8 ] = 3.0; apv[ 9 ] = 1.0;   // A(2,3)
apv[ 10 ] = 6.0; apv[ 11 ] = 0.0; // A(3,3)

var AFP = new Complex128Array( 6 );
var IPIV = new Int32Array( 3 );

// Right-hand side: b = (1+0i, 0+i, 1-i)
var B = new Complex128Array( 3 );
var bv = reinterpret( B, 0 );
bv[ 0 ] = 1.0; bv[ 1 ] = 0.0;
bv[ 2 ] = 0.0; bv[ 3 ] = 1.0;
bv[ 4 ] = 1.0; bv[ 5 ] = -1.0;

var X = new Complex128Array( 3 );
var rcond = new Float64Array( 1 );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 3 );

// Solve A*X = B with factorization
var info = zhpsvx.ndarray( 'not-factored', 'upper', 3, 1, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', info );
console.log( 'X:', reinterpret( X, 0 ) );
console.log( 'rcond:', rcond[ 0 ] );
console.log( 'FERR:', FERR[ 0 ] );
console.log( 'BERR:', BERR[ 0 ] );
