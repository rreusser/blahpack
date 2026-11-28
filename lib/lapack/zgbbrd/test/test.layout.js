/* eslint-disable no-restricted-syntax */

// Layout invariance (CONVENTIONS S13): the same problem, stored row-major, with
// padded leading dimensions, offsets and non-unit or negative vector strides,
// gives the canonical result. These inputs reach the calls that the
// stride-provenance lint rule found passing a literal or another array's stride
// (test/harness/LEARNINGS.md, 2026-11-20).

// MODULES //

import test from 'node:test';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import { specLayoutInvariant } from '../../../../test/harness/spec-layout.js';
import zgbbrd from './../lib/strided.js';

// FUNCTIONS //

function generator( seed ) {
	let s = seed;
	return function next() {
		s = ( ( s * 1103515245 ) + 12345 ) % 2147483648;
		return ( s / 2147483648 ) - 0.5;
	};
}

function reals( rnd, n, scale ) {
	return Float64Array.from( { 'length': n }, function v() {
		return rnd() * scale;
	});
}

function complexes( rnd, n, scale ) {
	return new Complex128Array( reals( rnd, 2 * n, scale ) );
}


// TESTS //

test( 'zgbbrd: the bidiagonal reduction does not depend on the storage of AB, Q, PT and C', function t() {
	[ [ 7, 6, 2, 3 ], [ 6, 7, 3, 2 ], [ 8, 8, 2, 2 ] ].forEach( function each( c ) {
		const rnd = generator( 99 + c[ 0 ] );
		const M = c[ 0 ];
		const N = c[ 1 ];
		const kl = c[ 2 ];
		const ku = c[ 3 ];
		const ld = kl + ku + 1;
		specLayoutInvariant( 'zgbbrd', zgbbrd, [ 'both', M, N, 2, kl, ku, complexes( rnd, ld * N, 1.0 ), 1, ld, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Complex128Array( M * M ), 1, M, 0, new Complex128Array( N * N ), 1, N, 0, complexes( rnd, M * 2, 1.0 ), 1, M, 0, new Complex128Array( 2 * Math.max( M, N ) ), 1, 0, new Float64Array( Math.max( M, N ) ), 1, 0 ] );
	});
});
