import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlartgs from './../lib/index.js';

const cs = new Float64Array( 1 );
const sn = new Float64Array( 1 );

dlartgs( 3.0, 4.0, 1.5, cs, sn );
let result = new Float64Array( [ cs[ 0 ], sn[ 0 ] ] );
console.log( result ); // eslint-disable-line no-console

dlartgs( -2.0, 3.0, 0.0, cs, sn );
result = new Float64Array( [ cs[ 0 ], sn[ 0 ] ] );
console.log( result ); // eslint-disable-line no-console
