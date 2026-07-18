/* eslint-disable camelcase, stdlib/require-file-extensions */

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlarfb_gett from '@stdlib/lapack/base/zlarfb_gett';

const K = 2;
const M = 3;
const N = 4;

const T = new Complex128Array( K * K );
const A = new Complex128Array( K * N );
const B = new Complex128Array( M * N );
const WORK = new Complex128Array( K * Math.max( K, N - K ) );

zlarfb_gett.ndarray( 'identity', M, N, K, T, 1, K, 0, A, 1, K, 0, B, 1, M, 0, WORK, 1, K, 0 );
console.log( A ); // eslint-disable-line no-console
