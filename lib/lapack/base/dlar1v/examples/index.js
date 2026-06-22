import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlar1v from './../lib/index.js';

var n = 5;
var td = [ 4.0, 4.0, 4.0, 4.0, 4.0 ];
var te = [ 1.0, 1.0, 1.0, 1.0 ];

var D = new Float64Array( n );
var L = new Float64Array( n );
var LD = new Float64Array( n );
var LLD = new Float64Array( n );
var Z = new Float64Array( n );
var WORK = new Float64Array( 4 * n );
var ISUPPZ = new Int32Array( 2 );
var negcnt = new Int32Array( 1 );
var ztz = new Float64Array( 1 );
var mingma = new Float64Array( 1 );
var r = new Int32Array( 1 );
var nrminv = new Float64Array( 1 );
var resid = new Float64Array( 1 );
var rqcorr = new Float64Array( 1 );
var lambda;
var i;

D[ 0 ] = td[ 0 ];
for ( i = 0; i < n - 1; i += 1 ) {
	L[ i ] = te[ i ] / D[ i ];
	D[ i + 1 ] = td[ i + 1 ] - ( L[ i ] * te[ i ] );
	LD[ i ] = L[ i ] * D[ i ];
	LLD[ i ] = L[ i ] * L[ i ] * D[ i ];
}

lambda = 4.0 - Math.sqrt( 3.0 );

dlar1v( n, 1, n, lambda, D, 1, L, 1, LD, 1, LLD, 1, 1e-300, 0.0, Z, 1, true, negcnt, ztz, mingma, r, ISUPPZ, 1, nrminv, resid, rqcorr, WORK, 1 ); // eslint-disable-line max-len

console.log( Z ); // eslint-disable-line no-console
console.log( 'r =', r[ 0 ], 'ztz =', ztz[ 0 ] ); // eslint-disable-line no-console
