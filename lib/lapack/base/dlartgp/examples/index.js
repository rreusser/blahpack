import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlartgp from './../lib/index.js';

let result = dlartgp( 3.0, 4.0, new Float64Array( 3 ) );
console.log( result ); // eslint-disable-line no-console

result = dlartgp( -3.0, -4.0, new Float64Array( 3 ) );
console.log( result ); // eslint-disable-line no-console
