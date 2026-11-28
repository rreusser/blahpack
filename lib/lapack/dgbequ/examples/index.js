
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgbequ from './../lib/index.js';

// Diagonal real band matrix (KL=0, KU=0):
const rowcnd = new Float64Array( 1 );
const colcnd = new Float64Array( 1 );
const amax = new Float64Array( 1 );

const AB = new Float64Array( [ 3, 1, 2 ] );
const r = new Float64Array( 3 );
const c = new Float64Array( 3 );
const out = dgbequ.strided( 3, 3, 0, 0, AB, 1, 1, 0, r, 1, 0, c, 1, 0, rowcnd, colcnd, amax ); // eslint-disable-line max-len

console.log( 'info:', out );   // eslint-disable-line no-console
console.log( 'amax:', amax[ 0 ] );   // eslint-disable-line no-console
console.log( 'r:', r );             // eslint-disable-line no-console
console.log( 'c:', c );             // eslint-disable-line no-console
