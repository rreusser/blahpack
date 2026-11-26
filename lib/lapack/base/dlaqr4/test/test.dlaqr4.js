/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqr4 from './../lib/dlaqr4.js';


// TESTS //

test( 'dlaqr4 is a function', function t() {
	assert.strictEqual( typeof dlaqr4, 'function', 'is a function' );
});

test( 'dlaqr4 has expected arity', function t() {
	assert.strictEqual( dlaqr4.length, 17, 'has expected arity' );
});

test( 'dlaqr4 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaqr4( 'column-major', 2, 2, -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dlaqr4 allocates a sufficient workspace when WORK is null (ticket 0096)', function t() {
	function cyclic( N ) {
		// Cyclic shift: eigenvalues are the N-th roots of unity, so AED stalls and the window grows past 32 with many undeflated shifts.
		const H = new Float64Array( N * N );
		let i;
		for ( i = 1; i < N; i++ ) {
			H[ i + ( ( i - 1 ) * N ) ] = 1.0;
		}
		H[ ( N - 1 ) * N ] = 1.0;
		return H;
	}
	function eye( N ) {
		const Z = new Float64Array( N * N );
		let i;
		for ( i = 0; i < N; i++ ) {
			Z[ i + ( i * N ) ] = 1.0;
		}
		return Z;
	}
	function run( N, WORK ) {
		const H = cyclic( N );
		const Z = eye( N );
		const WR = new Float64Array( N );
		const WI = new Float64Array( N );
		const info = dlaqr4( 'column-major', true, true, N, 1, N, H, N, WR, 1, WI, 1, 1, N, Z, N, WORK );
		return [ info, Array.from( WR ), Array.from( WI ), Array.from( H ), Array.from( Z ) ];
	}
	const sizes = [ 6, 300 ];
	let N, s;
	for ( s = 0; s < sizes.length; s++ ) {
		N = sizes[ s ];
		assert.deepEqual( run( N, null ), run( N, new Float64Array( 100 * N ) ) );
	}
});
