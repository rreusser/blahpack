/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqr0 from './../lib/zlaqr0.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

// 2x2 upper-triangular (Hessenberg) diag(3,5) (column-major):
function tri2() {
	return new Complex128Array([ 3.0, 0.0, 0.0, 0.0, 1.0, 0.0, 5.0, 0.0 ]);
}


// TESTS //

test( 'zlaqr0 is a function', function t() {
	assert.strictEqual( typeof zlaqr0, 'function', 'is a function' );
});

test( 'zlaqr0 has expected arity', function t() {
	assert.strictEqual( zlaqr0.length, 15, 'has expected arity' );
});

test( 'zlaqr0 throws a RangeError for LDH < max(1,N)', function t() {
	assert.throws( function throws() {
		zlaqr0( 'column-major', true, false, 2, 1, 2, tri2(), 1, new Complex128Array( 2 ), 1, 1, 2, new Complex128Array( 4 ), 2, null );
	}, RangeError );
});

test( 'zlaqr0 returns the eigenvalues of an upper-triangular Hessenberg matrix (auto WORK)', function t() {
	const w = new Complex128Array( 2 );
	const info = zlaqr0( 'column-major', true, false, 2, 1, 2, tri2(), 2, w, 1, 1, 2, new Complex128Array( 4 ), 2, null );
	assert.strictEqual( info, 0, 'info is 0' );

	const view = new Float64Array( w.buffer );
	const re = [ view[ 0 ], view[ 2 ] ].sort( function asc( a, b ) {
		return a - b;
	});
	assert.ok( Math.abs( re[ 0 ] - 3.0 ) < 1e-12 && Math.abs( re[ 1 ] - 5.0 ) < 1e-12, 'eigenvalues are 3 and 5' );
});

test( 'zlaqr0 matches the ndarray form', function t() {
	const w1 = new Complex128Array( 2 );
	const info1 = zlaqr0( 'column-major', true, false, 2, 1, 2, tri2(), 2, w1, 1, 1, 2, new Complex128Array( 4 ), 2, null );

	const w2 = new Complex128Array( 2 );
	const WORK = new Complex128Array( 2 );
	const info2 = ndarray( true, false, 2, 1, 2, tri2(), 1, 2, 0, w2, 1, 0, 1, 2, new Complex128Array( 4 ), 1, 2, 0, WORK, 1, 0 );

	assert.strictEqual( info1, info2, 'info matches' );
	const a1 = new Float64Array( w1.buffer );
	const a2 = new Float64Array( w2.buffer );
	for ( let i = 0; i < a1.length; i++ ) {
		assert.ok( Math.abs( a1[ i ] - a2[ i ] ) < 1e-14, 'w['+i+'] matches' );
	}
});

test( 'zlaqr0 allocates a sufficient workspace when WORK is null (ticket 0096)', function t() {
	function cyclic( N ) {
		// Cyclic shift: eigenvalues are the N-th roots of unity, so AED stalls and the window grows past 32 with many undeflated shifts.
		const H = new Float64Array( 2 * N * N );
		let i;
		for ( i = 1; i < N; i++ ) {
			H[ 2 * ( i + ( ( i - 1 ) * N ) ) ] = 1.0;
		}
		H[ 2 * ( ( N - 1 ) * N ) ] = 1.0;
		return H;
	}
	function eye( N ) {
		const Z = new Float64Array( 2 * N * N );
		let i;
		for ( i = 0; i < N; i++ ) {
			Z[ 2 * ( i + ( i * N ) ) ] = 1.0;
		}
		return Z;
	}
	function run( N, WORK ) {
		const H = new Complex128Array( cyclic( N ) );
		const Z = new Complex128Array( eye( N ) );
		const w = new Complex128Array( N );
		const info = zlaqr0( 'column-major', true, true, N, 1, N, H, N, w, 1, 1, N, Z, N, WORK );
		return [ info, Array.from( reinterpret( w, 0 ) ), Array.from( reinterpret( H, 0 ) ), Array.from( reinterpret( Z, 0 ) ) ];
	}
	const sizes = [ 6, 120 ];
	let N, s;
	for ( s = 0; s < sizes.length; s++ ) {
		N = sizes[ s ];
		assert.deepEqual( run( N, null ), run( N, new Complex128Array( 100 * N ) ) );
	}
});
