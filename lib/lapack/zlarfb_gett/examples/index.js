/* eslint-disable camelcase */

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarfb_gett from './../lib/index.js';

const K = 2;
const M = 3;
const N = 4;

// Upper-triangular K-by-K block reflector factor (column-major):
const T = new Complex128Array( [ 1.2, 0.1, 0.0, 0.0, -0.3, 0.2, 1.5, -0.1 ] );

// K-by-N upper-trapezoidal matrix (column-major):
const A = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 2.0, -0.5, 3.0, 0.25, 1.5, 0.0, -1.0, 1.0, 0.5, 0.5, 2.0, -0.25 ] );

// M-by-N matrix whose first K columns hold the reflector vectors (column-major):
const B = new Complex128Array( [ 0.1, 0.2, -0.3, 0.1, 0.5, -0.2, 0.4, 0.0, 0.2, 0.3, -0.1, -0.1, 1.0, 0.0, 2.0, 1.0, -1.0, 0.5, 0.5, -0.5, 1.5, 0.25, -0.75, 1.0 ] );
const WORK = new Complex128Array( K * Math.max( K, N - K ) );

zlarfb_gett.strided( 'not-identity', M, N, K, T, 1, K, 0, A, 1, K, 0, B, 1, M, 0, WORK, 1, K, 0 );
console.log( reinterpret( A, 0 ) ); // eslint-disable-line no-console
console.log( reinterpret( B, 0 ) ); // eslint-disable-line no-console
