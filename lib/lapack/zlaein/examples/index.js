/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaein from './../lib/base.js';

const N = 3;
const LDH = 3;
const H = new Complex128Array( N * LDH );
const w = new Complex128( 3.9, -0.95 );
const v = new Complex128Array( N );
const B = new Complex128Array( N * LDH );
const rwork = new Float64Array( N );

// Column-major 3x3 upper Hessenberg matrix:
H.set( [ 2.0, 1.0 ], 0 );
H.set( [ 0.1, 0.0 ], 1 );
H.set( [ 1.0, 0.5 ], LDH );
H.set( [ 3.0, 0.0 ], LDH + 1 );
H.set( [ 0.05, 0.0 ], LDH + 2 );
H.set( [ 0.5, 0.0 ], 2 * LDH );
H.set( [ 1.0, -1.0 ], ( 2 * LDH ) + 1 );
H.set( [ 4.0, -1.0 ], ( 2 * LDH ) + 2 );

const info = zlaein( true, true, N, H, 1, LDH, 0, w, v, 1, 0, B, 1, LDH, 0, rwork, 1, 0, 1.0e-4, 1.0e-292 ); // eslint-disable-line max-len
console.log( info ); // eslint-disable-line no-console
