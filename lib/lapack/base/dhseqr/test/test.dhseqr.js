/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dhseqr from './../lib/dhseqr.js';


// TESTS //

test( 'dhseqr is a function', function t() {
	assert.strictEqual( typeof dhseqr, 'function', 'is a function' );
});

test( 'dhseqr has expected arity', function t() {
	assert.strictEqual( dhseqr.length, 15, 'has expected arity' );
});

test( 'dhseqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dhseqr( 'column-major', 'eigenvalues', 'initialize', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dhseqr: work = null allocates enough for dlaqr0\'s blocked AED path (ticket 0096)', function t() {
	const N = 300;
	function run( work ) {
		const H = new Float64Array( N * N );
		const WR = new Float64Array( N );
		const WI = new Float64Array( N );
		const Z = new Float64Array( N * N );
		let i;
		for ( i = 1; i < N; i++ ) {
			H[ i + ( ( i - 1 ) * N ) ] = 1.0;
		}
		H[ ( N - 1 ) * N ] = 1.0;
		const info = dhseqr( 'column-major', 'schur', 'initialize', N, 1, N, H, N, WR, 1, WI, 1, Z, N, work );
		return [ info, Array.from( WR ), Array.from( WI ), Array.from( H ) ];
	}
	const r = run( null );
	assert.equal( r[ 0 ], 0, 'info' );
	assert.ok( r[ 1 ].every( Number.isFinite ), 'finite eigenvalues' );
	assert.deepEqual( r, run( new Float64Array( 100 * N ) ) );
});
