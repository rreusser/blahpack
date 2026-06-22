/* eslint-disable max-len, no-console */

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsfrk from './../lib/index.js';

// 3x2 matrix A (column-major, strideA1=1, strideA2=3):
var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );

// C in RFP format, N=3, transr='no-transpose', uplo='lower':
var C = new Float64Array( [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ] );

// Compute C := 1.0 * A * A^T + 0.0 * C
dsfrk.ndarray( 'no-transpose', 'lower', 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, 0.0, C, 1, 0 );

console.log( C );
// => Float64Array [ 17, 22, 27, 45, 29, 36 ]
