/* eslint-disable no-console, no-restricted-syntax, max-len */

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhbgst from './../lib/index.js';

var RWORK;
var LDAB;
var LDBB;
var WORK;
var info;
var AB;
var BB;
var av;
var bv;
var ka;
var kb;
var N;
var X;

// Small example: N=3, KA=1, KB=0 (diagonal B)
N = 3;
ka = 1;
kb = 0;
LDAB = ka + 1;
LDBB = kb + 1;

// Hermitian band matrix A in upper band storage (2 rows x 3 cols):
AB = new Complex128Array( LDAB * N );
av = reinterpret( AB, 0 );

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
BB = new Complex128Array( LDBB * N );
bv = reinterpret( BB, 0 );
bv[ 0 ] = 2.0;
bv[ 2 ] = 3.0;
bv[ 4 ] = 2.0;

WORK = new Complex128Array( N );
RWORK = new Float64Array( N );
X = new Complex128Array( 1 );

info = zhbgst.ndarray( 'none', 'upper', N, ka, kb, AB, 1, LDAB, 0, BB, 1, LDBB, 0, X, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

console.log( 'info: %d', info );
