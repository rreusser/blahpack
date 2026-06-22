
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zlacon from './../lib/index.js';

var N = 3;
var V = new Complex128Array( N );
var X = new Complex128Array( N );
var EST = new Float64Array( 1 );
var KASE = new Int32Array( 1 );

KASE[ 0 ] = 0;

// First call initializes X and requests A*X (KASE=1):
zlacon.ndarray( N, V, 1, 0, X, 1, 0, EST, KASE );
console.log( 'After init: KASE =', KASE[ 0 ] ); // 1
