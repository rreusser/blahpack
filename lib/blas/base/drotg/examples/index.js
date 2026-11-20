import Float64Array from '@stdlib/array/float64/lib/index.js';
import drotg from './../lib/base.js';


const ab = new Float64Array( [ 3.0, 4.0 ] );
const cs = new Float64Array( 2 );

drotg( ab.subarray( 0, 1 ), ab.subarray( 1, 2 ), cs.subarray( 0, 1 ), cs.subarray( 1, 2 ) );
console.log( 'r=%d, z=%d', ab[ 0 ], ab[ 1 ] ); // eslint-disable-line no-console
console.log( 'c=%d, s=%d', cs[ 0 ], cs[ 1 ] ); // eslint-disable-line no-console
