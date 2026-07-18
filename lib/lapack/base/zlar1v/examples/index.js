import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlar1v from './../lib/index.js';

const n = 5;
const td = [ 4.0, 4.0, 4.0, 4.0, 4.0 ];
const te = [ 1.0, 1.0, 1.0, 1.0 ];

const D = new Float64Array( n );
const L = new Float64Array( n );
const LD = new Float64Array( n );
const LLD = new Float64Array( n );
const Z = new Complex128Array( n );
const WORK = new Float64Array( 4 * n );
const ISUPPZ = new Int32Array( 2 );
const negcnt = new Int32Array( 1 );
const ztz = new Float64Array( 1 );
const mingma = new Float64Array( 1 );
const r = new Int32Array( 1 );
const nrminv = new Float64Array( 1 );
const resid = new Float64Array( 1 );
const rqcorr = new Float64Array( 1 );
let i;

D[ 0 ] = td[ 0 ];
for ( i = 0; i < n - 1; i += 1 ) {
	L[ i ] = te[ i ] / D[ i ];
	D[ i + 1 ] = td[ i + 1 ] - ( L[ i ] * te[ i ] );
	LD[ i ] = L[ i ] * D[ i ];
	LLD[ i ] = L[ i ] * L[ i ] * D[ i ];
}

const lambda = 4.0 - Math.sqrt( 3.0 );

zlar1v( n, 1, n, lambda, D, 1, L, 1, LD, 1, LLD, 1, 1e-300, 0.0, Z, 1, true, negcnt, ztz, mingma, r, ISUPPZ, 1, nrminv, resid, rqcorr, WORK, 1 ); // eslint-disable-line max-len

console.log( Z ); // eslint-disable-line no-console
console.log( 'r =', r[ 0 ], 'ztz =', ztz[ 0 ] ); // eslint-disable-line no-console
