/* eslint-disable no-restricted-syntax */

// Layout invariance (CONVENTIONS S13): the same problem, stored row-major, with
// padded leading dimensions, offsets and non-unit or negative vector strides,
// gives the canonical result. These inputs reach the calls that the
// stride-provenance lint rule found passing a literal or another array's stride
// (test/harness/LEARNINGS.md, 2026-11-20).

// MODULES //

import test from 'node:test';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import { specLayoutInvariant } from '../../../../../test/harness/spec-layout.js';
import dgees from './../lib/ndarray.js';

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


// TESTS //

test( 'dgees: Schur form, eigenvalues and vectors do not depend on the storage layout (scaled, sorted)', function t() {
	const rnd = generator( 12345 );
	const N = 5;
	specLayoutInvariant( 'dgees', dgees, [ 'compute-vectors', 'sort', function select( wr ) {
		return wr > 0.0;
	}, N, reals( rnd, N * N, 1.0e150 ), 1, N, 0, new Int32Array( 1 ), new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( N * N ), 1, N, 0, new Float64Array( 10 * N ), 1, 0, new Uint8Array( N ), 1, 0 ] );
});
