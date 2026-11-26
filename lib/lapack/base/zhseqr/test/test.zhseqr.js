/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhseqr from './../lib/zhseqr.js';


// TESTS //

test( 'zhseqr is a function', function t() {
	assert.strictEqual( typeof zhseqr, 'function', 'is a function' );
});

test( 'zhseqr has expected arity', function t() {
	assert.strictEqual( zhseqr.length, 13, 'has expected arity' );
});

test( 'zhseqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhseqr( 'column-major', 'eigenvalues', 'initialize', -1, 2, 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zhseqr: WORK = null allocates enough for zlaqr0\'s blocked AED path (ticket 0096)', function t() {
	const N = 120;
	function run( work ) {
		const H = new Complex128Array( N * N );
		const h = reinterpret( H, 0 );
		const W = new Complex128Array( N );
		const Z = new Complex128Array( N * N );
		let i;
		for ( i = 1; i < N; i++ ) {
			h[ 2 * ( i + ( ( i - 1 ) * N ) ) ] = 1.0;
		}
		h[ 2 * ( N - 1 ) * N ] = 1.0;
		const info = zhseqr( 'column-major', 'schur', 'initialize', N, 1, N, H, N, W, 1, Z, N, work );
		return [ info, Array.from( reinterpret( W, 0 ) ), Array.from( h ) ];
	}
	const r = run( null );
	assert.equal( r[ 0 ], 0, 'info' );
	assert.ok( r[ 1 ].every( Number.isFinite ), 'finite eigenvalues' );
	assert.deepEqual( r, run( new Complex128Array( 100 * N ) ) );
});
