/* eslint-disable no-console, no-restricted-syntax, max-len */

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhbgst from './../lib/index.js';


// Small example: N=3, KA=1, KB=0 (diagonal B)
const N = 3;
const ka = 1;
const kb = 0;
const LDAB = ka + 1;
const LDBB = kb + 1;

// Hermitian band matrix A in upper band storage (2 rows x 3 cols):
const AB = new Complex128Array( LDAB * N );
const av = reinterpret( AB, 0 );

// Diagonal: [5, 6, 7]
av[ 2 ] = 5.0;
av[ 6 ] = 6.0;
av[ 10 ] = 7.0;

// 1st superdiag: [1+0.5i, 0.5-i]
av[ 4 ] = 1.0;
av[ 5 ] = 0.5;
av[ 8 ] = 0.5;
av[ 9 ] = -1.0;

// Diagonal B (already factored by zpbstf):
const BB = new Complex128Array( LDBB * N );
const bv = reinterpret( BB, 0 );
bv[ 0 ] = 2.0;
bv[ 2 ] = 3.0;
bv[ 4 ] = 2.0;

const WORK = new Complex128Array( N );
const RWORK = new Float64Array( N );
const X = new Complex128Array( 1 );

const info = zhbgst.ndarray( 'none', 'upper', N, ka, kb, AB, 1, LDAB, 0, BB, 1, LDBB, 0, X, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

console.log( 'info: %d', info );
