import Float64Array from '@stdlib/array/float64/lib/index.js';
import zrotg from './../lib/base.js';

// Generate a complex Givens rotation:
var out = new Float64Array( 8 );
zrotg( 3.0, 0.0, 4.0, 0.0, out, 1, 0 );
console.log( out ); // eslint-disable-line no-console
