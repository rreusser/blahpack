import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlartgp from './../lib/index.js';

const cs = new Float64Array( 1 );
const sn = new Float64Array( 1 );
const r = new Float64Array( 1 );

dlartgp( 3.0, 4.0, cs, sn, r );
let result = new Float64Array( [ cs[ 0 ], sn[ 0 ], r[ 0 ] ] );
console.log( result ); // eslint-disable-line no-console

dlartgp( -3.0, -4.0, cs, sn, r );
result = new Float64Array( [ cs[ 0 ], sn[ 0 ], r[ 0 ] ] );
console.log( result ); // eslint-disable-line no-console
