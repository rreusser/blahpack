
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zggsvp3 from './../lib/index.js';

// Construct a small complex matrix pair (M=2, P=2, N=2) stored column-major:
var A = new Complex128Array( [ 1.0, 0.5, 2.0, 0.0, 3.0, -0.5, 4.0, 1.0 ] );
var B = new Complex128Array( [ 5.0, 0.0, 1.0, 0.5, 1.0, -0.5, 5.0, 0.0 ] );

var U = new Complex128Array( 4 );
var V = new Complex128Array( 4 );
var Q = new Complex128Array( 4 );
var IWORK = new Int32Array( 2 );
var RWORK = new Float64Array( 4 );
var TAU = new Complex128Array( 2 );
var WORK = new Complex128Array( 200 );
var K = [ 0 ];
var L = [ 0 ];

var info = zggsvp3.ndarray( 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, A, 1, 2, 0, B, 1, 2, 0, 1e-8, 1e-8, K, L, U, 1, 2, 0, V, 1, 2, 0, Q, 1, 2, 0, IWORK, 1, 0, RWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, 200 ); // eslint-disable-line max-len

console.log( 'info: %d, K: %d, L: %d', info, K[ 0 ], L[ 0 ] ); // eslint-disable-line no-console
