/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhfrk from './../lib/index.js';

// 3x2 complex matrix A (column-major, strideA1=1, strideA2=3):
var A = new Complex128Array( [ 1.0, 0.5, 2.0, 0.5, 3.0, 0.5, 1.0, 1.0, 2.0, 1.0, 3.0, 1.0 ] );

// C in RFP format, N=3, transr='no-transpose', uplo='lower' (6 complex elements):
var C = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ] );

// Compute C := 1.0 * A * A^H + 0.0 * C
zhfrk.ndarray( 'no-transpose', 'lower', 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, 0.0, C, 1, 0 );

console.log( reinterpret( C, 0 ) );
