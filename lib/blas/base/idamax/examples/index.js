import Float64Array from '@stdlib/array/float64/lib/index.js';
import idamax from './../lib/base.js';

// Find the index of the element with max absolute value:
var x = new Float64Array( [ 1.0, -4.0, 3.0, 2.0 ] );

var idx = idamax( 4, x, 1, 0 );
console.log( idx ); // eslint-disable-line no-console
// => 1
