/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// Layout invariance (CONVENTIONS S13): the same problem, stored row-major, with
// padded leading dimensions, offsets and non-unit or negative vector strides,
// gives the canonical result. These inputs reach the calls that the
// stride-provenance lint rule found passing a literal or another array's stride
// (test/harness/LEARNINGS.md, 2026-11-20).

// MODULES //

import test from 'node:test';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import { specLayoutInvariant } from '../../../../../test/harness/spec-layout.js';
import zunbdb3 from './../lib/ndarray.js';

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

// X11 and X21 deliberately have different leading dimensions: the rotation of
// X21 used X11's stride (as the reference does, see DIFFERENCES.md), which is
// only right when the two coincide.
test( 'zunbdb3: the simultaneous bidiagonalization does not depend on the storage of X11 and X21', function t() {
	const rnd = generator( 31337 );
	const M = 8;
	const P = 5;
	const Q = 4;
	specLayoutInvariant( 'zunbdb3', zunbdb3, [ M, P, Q, complexes( rnd, P * Q, 1.0 ), 1, P, 0, complexes( rnd, ( M - P ) * Q, 1.0 ), 1, M - P, 0, new Float64Array( Q ), 1, 0, new Float64Array( Q ), 1, 0, new Complex128Array( P ), 1, 0, new Complex128Array( M - P ), 1, 0, new Complex128Array( Q ), 1, 0, new Complex128Array( 4 * M ), 1, 0 ] );
});
