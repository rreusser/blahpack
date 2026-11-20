
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaic1 from './../lib/index.js';

const sestpr = new Float64Array( 1 );
const s = new Float64Array( 1 );
const c = new Float64Array( 1 );

const x = new Float64Array( [ 0.6, 0.8, 0.0 ] );
const w = new Float64Array( [ 1.0, 2.0, 3.0 ] );

dlaic1( 'largest-singular-value', 3, x, 1, 5.0, w, 1, 2.0, sestpr, s, c );
console.log( 'Largest singular value estimate:' ); // eslint-disable-line no-console
console.log( '  sestpr =', sestpr[ 0 ] ); // eslint-disable-line no-console
console.log( '  s =', s[ 0 ] ); // eslint-disable-line no-console
console.log( '  c =', c[ 0 ] ); // eslint-disable-line no-console

dlaic1( 'smallest-singular-value', 3, x, 1, 5.0, w, 1, 2.0, sestpr, s, c );
console.log( 'Smallest singular value estimate:' ); // eslint-disable-line no-console
console.log( '  sestpr =', sestpr[ 0 ] ); // eslint-disable-line no-console
console.log( '  s =', s[ 0 ] ); // eslint-disable-line no-console
console.log( '  c =', c[ 0 ] ); // eslint-disable-line no-console
