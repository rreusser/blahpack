import Float64Array from '@stdlib/array/float64/lib/index.js';
import dcabs1 from './../lib/base.js';

// Compute |Re(z)| + |Im(z)| for z = 3 + 4i:
var z = new Float64Array( [ 3.0, 4.0 ] );
var result = dcabs1( z );
console.log( result ); // eslint-disable-line no-console
// => 7.0
