/* eslint-disable no-restricted-syntax, max-len */

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import ztgsen from './../lib/index.js';

// 3x3 upper triangular matrix pair (column-major, interleaved re/im):
const A = new Complex128Array( [ 2.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.5, -0.2, 4.0, 0.0, 0.0, 0.0, 0.3, 0.1, 0.7, -0.3, 6.0, -1.0 ] );
const B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.05, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, -0.1, 1.0, 0.0 ] );
const Q = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
const Z = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );

// Select the first and third eigenvalues (move them to the leading block):
const SELECT = new Uint8Array( [ 1, 0, 1 ] );
const ALPHA = new Complex128Array( 3 );
const BETA = new Complex128Array( 3 );
const DIF = new Float64Array( 2 );
const WORK = new Complex128Array( 64 );
const IWORK = new Int32Array( 64 );

const r = ztgsen( 'column-major', 0, true, true, SELECT, 1, 3, A, 3, B, 3, ALPHA, 1, BETA, 1, Q, 3, Z, 3, 0, 1.0, 1.0, DIF, 1, WORK, 1, -1, IWORK, 1, 0, -1 );

console.log( 'info:', r.info ); // eslint-disable-line no-console
console.log( 'm (selected):', r.m ); // eslint-disable-line no-console
