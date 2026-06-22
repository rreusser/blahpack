
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zlaic1 from './../lib/index.js';

var x = new Complex128Array( [ 0.6, 0.1, 0.5, -0.2, 0.4, 0.3 ] );
var w = new Complex128Array( [ 0.3, 0.4, 0.7, -0.1, 0.2, 0.5 ] );
var gamma = new Complex128( 1.0, 0.5 );
var sestpr = new Float64Array( 1 );
var s = new Float64Array( 2 );
var c = new Float64Array( 2 );

zlaic1.ndarray( 'largest-singular-value', 3, x, 1, 0, 2.5, w, 1, 0, gamma, sestpr, s, c );

console.log( 'sestpr:', sestpr[ 0 ] ); // eslint-disable-line no-console
console.log( 's:', s[ 0 ], s[ 1 ] ); // eslint-disable-line no-console
console.log( 'c:', c[ 0 ], c[ 1 ] ); // eslint-disable-line no-console
