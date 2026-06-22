/* eslint-disable no-console */

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztgsja from './../lib/index.js';

// Set up a 2x2 GSVD problem with K=0, L=2:
var M = 2;
var P = 2;
var N = 2;
var K = 0;
var L = 2;
var A = new Complex128Array( M * N );
var Av = reinterpret( A, 0 );
var B = new Complex128Array( P * N );
var Bv = reinterpret( B, 0 );
var ALPHA = new Float64Array( N );
var BETA = new Float64Array( N );
var U = new Complex128Array( M * M );
var V = new Complex128Array( P * P );
var Q = new Complex128Array( N * N );
var WORK = new Complex128Array( 2 * N );
var ncycle = new Int32Array( 1 );
var info;

// A(0,0) = 5+1i, A(0,1) = 2+0.5i, A(1,1) = 3+0i
Av[ 0 ] = 5.0;
Av[ 1 ] = 1.0;
Av[ 4 ] = 2.0;
Av[ 5 ] = 0.5;
Av[ 6 ] = 3.0;
Av[ 7 ] = 0.0;

// B(0,0) = 4+0i, B(0,1) = 1+0.25i, B(1,1) = 2+0i
Bv[ 0 ] = 4.0;
Bv[ 1 ] = 0.0;
Bv[ 4 ] = 1.0;
Bv[ 5 ] = 0.25;
Bv[ 6 ] = 2.0;
Bv[ 7 ] = 0.0;

info = ztgsja.ndarray( 'initialize', 'initialize', 'initialize', M, P, N, K, L, A, 1, M, 0, B, 1, P, 0, 1e-14, 1e-14, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, ncycle ); // eslint-disable-line max-len

console.log( 'info:', info );
console.log( 'ALPHA:', ALPHA );
console.log( 'BETA:', BETA );
console.log( 'ncycle:', ncycle[ 0 ] );
