/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlag2c from './../lib/index.js';

var M = 3;
var N = 3;
var A = new Complex128Array( M * N );
var SA = new Complex128Array( M * N );
var v = reinterpret( A, 0 );
var i;
var info;

for ( i = 0; i < 2 * M * N; i++ ) {
	v[ i ] = ( i + 1 ) * 0.5;
}
info = zlag2c( 'column-major', M, N, A, M, SA, M );
console.log( 'info = %d', info ); // eslint-disable-line no-console
console.log( reinterpret( SA, 0 ) ); // eslint-disable-line no-console
