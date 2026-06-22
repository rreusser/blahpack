import Float64Array from '@stdlib/array/float64/lib/index.js';
import dzasum from './../lib/base.js';

// Sum of |Re| + |Im| for each complex element:
var zx = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );

var result = dzasum( 2, zx, 1, 0 );
console.log( result ); // eslint-disable-line no-console
// => 10.0
