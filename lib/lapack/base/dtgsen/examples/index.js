
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import dtgsen from './../lib/index.js';

const N = 3;

// Upper triangular A and B (generalized Schur form), column-major:
const A = new Float64Array( [ 1.0, 0.0, 0.0, 0.5, 2.0, 0.0, 0.3, 0.4, 3.0 ] );
const B = new Float64Array( [ 1.0, 0.0, 0.0, 0.2, 1.5, 0.0, 0.1, 0.3, 2.0 ] );
const Q = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
const Z = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
const SELECT = new Uint8Array( [ 0, 0, 1 ] );
const ALPHAR = new Float64Array( N );
const ALPHAI = new Float64Array( N );
const BETA = new Float64Array( N );
const M = new Int32Array( 1 );
const pl = new Float64Array( 1 );
const pr = new Float64Array( 1 );
const DIF = new Float64Array( 2 );
const WORK = new Float64Array( 200 );
const IWORK = new Int32Array( 200 );

const info = dtgsen( 0, true, true, SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, Q, 1, N, 0, Z, 1, N, 0, M, pl, pr, DIF, 1, 0, WORK, 1, 0, 200, IWORK, 1, 0, 200 ); // eslint-disable-line max-len

console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'M:', M[ 0 ] ); // eslint-disable-line no-console
console.log( 'ALPHAR:', ALPHAR ); // eslint-disable-line no-console
console.log( 'BETA:', BETA ); // eslint-disable-line no-console
