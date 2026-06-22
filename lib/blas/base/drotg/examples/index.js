import Float64Array from '@stdlib/array/float64/lib/index.js';
import drotg from './../lib/base.js';

// Generate a Givens rotation:
var ab = new Float64Array( [ 3.0, 4.0 ] );
var cs = new Float64Array( 2 );

drotg( ab, 1, 0, cs, 1, 0 );
console.log( 'r=%d, z=%d', ab[ 0 ], ab[ 1 ] ); // eslint-disable-line no-console
console.log( 'c=%d, s=%d', cs[ 0 ], cs[ 1 ] ); // eslint-disable-line no-console
