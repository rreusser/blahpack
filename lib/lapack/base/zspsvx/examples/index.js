import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zspsvx from './../lib/index.js';

// 3x3 complex symmetric matrix in lower packed storage:
// A = [(4+i) (2-i) (1+2i); (2-i) (5+0.5i) (3-i); (1+2i) (3-i) (6+i)]
var AP = new Complex128Array( [ 4, 1, 2, -1, 1, 2, 5, 0.5, 3, -1, 6, 1 ] );
var AFP = new Complex128Array( 6 );
var IPIV = new Int32Array( 3 );

// Right-hand side: b = A * [1; 1; 1]
var B = new Complex128Array( [ 7, 2, 10, -1.5, 10, 2 ] );
var X = new Complex128Array( 3 );
var rcond = new Float64Array( 1 );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 3 );

var info = zspsvx.ndarray( 'not-factored', 'lower', 3, 1, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', info );
console.log( 'X:', X );
console.log( 'rcond:', rcond[ 0 ] );
console.log( 'FERR:', FERR[ 0 ] );
console.log( 'BERR:', BERR[ 0 ] );
