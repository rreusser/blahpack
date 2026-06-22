
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaic1 from './../lib/index.js';

var x = new Float64Array( [ 0.6, 0.8, 0.0 ] );
var w = new Float64Array( [ 1.0, 2.0, 3.0 ] );
var out = new Float64Array( 3 );

dlaic1( 'largest-singular-value', 3, x, 1, 5.0, w, 1, 2.0, out );
console.log( 'Largest singular value estimate:' ); // eslint-disable-line no-console
console.log( '  sestpr =', out[ 0 ] ); // eslint-disable-line no-console
console.log( '  s =', out[ 1 ] ); // eslint-disable-line no-console
console.log( '  c =', out[ 2 ] ); // eslint-disable-line no-console

dlaic1( 'smallest-singular-value', 3, x, 1, 5.0, w, 1, 2.0, out );
console.log( 'Smallest singular value estimate:' ); // eslint-disable-line no-console
console.log( '  sestpr =', out[ 0 ] ); // eslint-disable-line no-console
console.log( '  s =', out[ 1 ] ); // eslint-disable-line no-console
console.log( '  c =', out[ 2 ] ); // eslint-disable-line no-console
