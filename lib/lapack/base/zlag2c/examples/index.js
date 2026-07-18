/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlag2c from './../lib/index.js';

const M = 3;
const N = 3;
const A = new Complex128Array( M * N );
const SA = new Complex128Array( M * N );
const v = reinterpret( A, 0 );
let i;

for ( i = 0; i < 2 * M * N; i++ ) {
	v[ i ] = ( i + 1 ) * 0.5;
}
const info = zlag2c( 'column-major', M, N, A, M, SA, M );
console.log( 'info = %d', info ); // eslint-disable-line no-console
console.log( reinterpret( SA, 0 ) ); // eslint-disable-line no-console
