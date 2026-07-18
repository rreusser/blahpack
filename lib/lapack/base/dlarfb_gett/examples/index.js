/* eslint-disable camelcase */

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarfb_gett from './../lib/index.js';

const M = 2;
const N = 3;
const K = 1;
const LDA = K;
const LDB = M;
const LDT = K;
const LDW = K;

// A is K-by-N upper-trapezoidal (no V1 below diagonal when K=1):
const A = new Float64Array( [ 2.0, 1.0, 0.5 ] );

// B is M-by-N: first K columns are V2, last N-K columns are B block:
const B = new Float64Array( [ 0.25, 0.5, 1.0, 3.0, 2.0, 4.0 ] );

// T is K-by-K upper triangular:
const T = new Float64Array( [ 1.4 ] );

// WORK is K-by-N scratch space:
const WORK = new Float64Array( K * N );

dlarfb_gett( 'column-major', 'identity', M, N, K, T, LDT, A, LDA, B, LDB, WORK, LDW );
console.log( A ); // eslint-disable-line no-console
console.log( B ); // eslint-disable-line no-console
