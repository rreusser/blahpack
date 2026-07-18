/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgsvj1 from './../lib/index.js';

const EPS = 2.220446049250313e-16;
const SFMIN = 2.2250738585072014e-308;
const TOL = 1.0e-10;

let i, j, s;

// Build a 4-by-3 complex column-major matrix.
const A = new Complex128Array( [ 1, 0.5, 2, -0.5, 3, 1, 4, -1, 5, 0.25, 6, -0.25, 7, 0.75, 8, -0.75, 9, 0, 10, 0.1, 11, -0.2, 12, 0.3 ] ); // eslint-disable-line max-len
const d = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );

// Compute initial column 2-norms.
const sva = new Float64Array( 3 );
const view = reinterpret( A, 0 );
for ( j = 0; j < 3; j++ ) {
	s = 0.0;
	for ( i = 0; i < 4; i++ ) {
		s += view[ 2 * ( ( j * 4 ) + i ) ] * view[ 2 * ( ( j * 4 ) + i ) ];
		s += view[ ( 2 * ( ( j * 4 ) + i ) ) + 1 ] * view[ ( 2 * ( ( j * 4 ) + i ) ) + 1 ];
	}
	sva[ j ] = Math.sqrt( s );
}

// `V` is sized to satisfy `LDV >= max(1, M)` even when `jobv === 'no-v'`.
const V = new Complex128Array( 4 );
const work = new Complex128Array( 4 );

// Apply 5 sweeps targeting the (col 0) vs (cols 1,2) off-diagonal block.
const info = zgsvj1( 'column-major', 'no-v', 4, 3, 1, A, 4, d, 1, sva, 1, 0, V, 4, EPS, SFMIN, TOL, 5, work, 1, 4 ); // eslint-disable-line max-len
console.log( 'info: %d', info ); // eslint-disable-line no-console
