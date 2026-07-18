/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ztprfb from './../lib/index.js';

// Small COL/FORWARD/LEFT example: M=5, N=4, K=3, L=2.
const V = new Complex128Array( 15 );
const T = new Complex128Array( 9 );
const A = new Complex128Array( 12 );
const B = new Complex128Array( 20 );
const W = new Complex128Array( 12 );

ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, V, 5, T, 3, A, 3, B, 5, W, 3 );
console.log( B ); // eslint-disable-line no-console
