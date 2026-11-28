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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import { specLayoutInvariant } from '../../../../test/harness/spec-layout.js';
import ztgsna from './../lib/strided.js';

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

function upperTriangular( rnd, N ) {
	const A = complexes( rnd, N * N, 1.0 );
	const v = new Float64Array( A.buffer );
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j + 1; i < N; i++ ) {
			v[ 2 * ( i + ( j * N ) ) ] = 0.0;
			v[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = 0.0;
		}
	}
	return A;
}


// TESTS //

test( 'ztgsna: eigenvalue condition numbers do not depend on the storage of the eigenvectors', function t() {
	const rnd = generator( 4242 );
	const N = 4;
	specLayoutInvariant( 'ztgsna', ztgsna, [ 'eigenvalues', 'all', new Uint8Array( N ), 1, 0, N, upperTriangular( rnd, N ), 1, N, 0, upperTriangular( rnd, N ), 1, N, 0, complexes( rnd, N * N, 1.0 ), 1, N, 0, complexes( rnd, N * N, 1.0 ), 1, N, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, N, new Int32Array( 1 ), new Complex128Array( 2 * N * N ), 1, 0, new Int32Array( N + 2 ), 1, 0 ] );
});
