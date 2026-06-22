
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgbequ from './../lib/index.js';

// Diagonal complex band matrix (KL=0, KU=0):
var AB = new Complex128Array( [ 3, 4, 1, 0, 0, 2 ] );
var r = new Float64Array( 3 );
var c = new Float64Array( 3 );
var out = zgbequ.ndarray( 3, 3, 0, 0, AB, 1, 1, 0, r, 1, 0, c, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', out.info );   // eslint-disable-line no-console
console.log( 'amax:', out.amax );   // eslint-disable-line no-console
console.log( 'r:', r );             // eslint-disable-line no-console
console.log( 'c:', c );             // eslint-disable-line no-console
