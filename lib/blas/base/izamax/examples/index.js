import Float64Array from '@stdlib/array/float64/lib/index.js';
import izamax from './../lib/base.js';

// Find index of element with max |Re| + |Im|:
var zx = new Float64Array( [ 1.0, 2.0, 5.0, 1.0, 3.0, 4.0 ] );

var idx = izamax( 3, zx, 1, 0 );
console.log( idx ); // eslint-disable-line no-console
// => 2
