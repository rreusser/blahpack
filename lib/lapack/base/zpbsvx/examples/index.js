import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpbsvx from './../lib/base.js';

// 3x3 Hermitian positive definite band matrix, KD=1, upper band storage:
// A = [ 4     -1+0.5i  0       ]
//     [ -1-0.5i  4    -1+0.5i  ]
//     [ 0     -1-0.5i  4       ]
var AB = new Complex128Array( [ 0, 0, 4, 0, -1, 0.5, 4, 0, -1, 0.5, 4, 0 ] );
var AFB = new Complex128Array( 6 );
var S = new Float64Array( 3 );
var equed = [ 'none' ];
var B = new Complex128Array( [ 1, 1, 2, -1, 3, 0 ] );
var X = new Complex128Array( 3 );
var rcond = new Float64Array( 1 );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 3 );

var info = zpbsvx( 'not-factored', 'upper', 3, 1, 1, AB, 1, 2, 0, AFB, 1, 2, 0, equed, S, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', info );
console.log( 'X (re/im pairs):', Array.from( reinterpret( X, 0 ) ) );
console.log( 'rcond:', rcond[ 0 ] );
