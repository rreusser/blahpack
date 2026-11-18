import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlartgs from './../lib/index.js';

let result = dlartgs( 3.0, 4.0, 1.5, new Float64Array( 2 ) );
console.log( result ); // eslint-disable-line no-console

result = dlartgs( -2.0, 3.0, 0.0, new Float64Array( 2 ) );
console.log( result ); // eslint-disable-line no-console
