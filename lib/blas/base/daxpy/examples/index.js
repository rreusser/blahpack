import Float64Array from '@stdlib/array/float64/lib/index.js';
import daxpy from './../lib/base.js';

// Scale x by alpha and add to y: y = alpha*x + y
var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
var y = new Float64Array( [ 10.0, 20.0, 30.0, 40.0, 50.0 ] );

daxpy( 5, 2.0, x, 1, 0, y, 1, 0 );
console.log( y ); // eslint-disable-line no-console
// => <Float64Array>[ 12, 24, 36, 48, 60 ]
