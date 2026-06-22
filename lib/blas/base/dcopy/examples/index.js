import Float64Array from '@stdlib/array/float64/lib/index.js';
import dcopy from './../lib/base.js';

// Copy x into y:
var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
var y = new Float64Array( 5 );

dcopy( 5, x, 1, 0, y, 1, 0 );
console.log( y ); // eslint-disable-line no-console
// => <Float64Array>[ 1, 2, 3, 4, 5 ]
