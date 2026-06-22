/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgsvj1 from './../lib/dgsvj1.js';

var EPS = 2.220446049250313e-16;
var SFMIN = 2.2250738585072014e-308;
var TOL = 1.0e-10;

// Build a 4-by-3 column-major matrix and rotate the first column against the next two:
var M = 4;
var N = 3;
var n1 = 1;
var A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
var d = new Float64Array( [ 1, 1, 1 ] );
var sva = new Float64Array( N );
var V = new Float64Array( 1 );
var work = new Float64Array( M );
var info;
var i;
var j;
var s;

for ( j = 0; j < N; j++ ) {
	s = 0;
	for ( i = 0; i < M; i++ ) {
		s += A[ ( j * M ) + i ] * A[ ( j * M ) + i ];
	}
	sva[ j ] = Math.sqrt( s );
}

info = dgsvj1( 'column-major', 'no-v', M, N, n1, A, M, d, 1, sva, 1, 0, V, 1, EPS, SFMIN, TOL, 5, work, 1, M );
console.log( 'info: %d', info ); // eslint-disable-line no-console
console.log( 'sva: %s', sva.toString() ); // eslint-disable-line no-console
