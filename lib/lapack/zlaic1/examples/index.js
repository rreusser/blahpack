
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zlaic1 from './../lib/index.js';

const x = new Complex128Array( [ 0.6, 0.1, 0.5, -0.2, 0.4, 0.3 ] );
const w = new Complex128Array( [ 0.3, 0.4, 0.7, -0.1, 0.2, 0.5 ] );
const gamma = new Complex128( 1.0, 0.5 );
const sestpr = new Float64Array( 1 );
const s = new Complex128Array( 1 );
const c = new Complex128Array( 1 );

zlaic1.strided( 'largest-singular-value', 3, x, 1, 0, 2.5, w, 1, 0, gamma, sestpr, s, 0, c, 0 );

console.log( 'sestpr:', sestpr[ 0 ] ); // eslint-disable-line no-console
console.log( 's:', s.get( 0 ) ); // eslint-disable-line no-console
console.log( 'c:', c.get( 0 ) ); // eslint-disable-line no-console
