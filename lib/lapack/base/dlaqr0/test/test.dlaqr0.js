/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqr0 from './../lib/dlaqr0.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

// 2x2 upper-triangular (Hessenberg) diag(3,5) (column-major):
function tri2() {
	return new Float64Array([ 3.0, 0.0, 1.0, 5.0 ]);
}


// TESTS //

test( 'dlaqr0 is a function', function t() {
	assert.strictEqual( typeof dlaqr0, 'function', 'is a function' );
});

test( 'dlaqr0 has expected arity', function t() {
	assert.strictEqual( dlaqr0.length, 17, 'has expected arity' );
});

test( 'dlaqr0 throws a RangeError for a negative N', function t() {
	assert.throws( function throws() {
		dlaqr0( 'column-major', true, false, -1, 1, 2, tri2(), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 1, 2, new Float64Array( 4 ), 2, null );
	}, RangeError );
});

test( 'dlaqr0 returns the eigenvalues of an upper-triangular Hessenberg matrix (auto WORK)', function t() {
	const WR = new Float64Array( 2 );
	const WI = new Float64Array( 2 );
	const info = dlaqr0( 'column-major', true, false, 2, 1, 2, tri2(), 2, WR, 1, WI, 1, 1, 2, new Float64Array( 4 ), 2, null );
	assert.strictEqual( info, 0, 'info is 0' );

	const re = [ WR[ 0 ], WR[ 1 ] ].sort( function asc( a, b ) {
		return a - b;
	});
	assert.ok( Math.abs( re[ 0 ] - 3.0 ) < 1e-12 && Math.abs( re[ 1 ] - 5.0 ) < 1e-12, 'real eigenvalues are 3 and 5' );
	assert.ok( Math.abs( WI[ 0 ] ) < 1e-12 && Math.abs( WI[ 1 ] ) < 1e-12, 'imaginary parts are zero' );
});

test( 'dlaqr0 matches the ndarray form', function t() {
	const WR1 = new Float64Array( 2 );
	const WI1 = new Float64Array( 2 );
	const info1 = dlaqr0( 'column-major', true, false, 2, 1, 2, tri2(), 2, WR1, 1, WI1, 1, 1, 2, new Float64Array( 4 ), 2, null );

	const WR2 = new Float64Array( 2 );
	const WI2 = new Float64Array( 2 );
	const WORK = new Float64Array( 2 );
	const info2 = ndarray( true, false, 2, 1, 2, tri2(), 1, 2, 0, WR2, 1, 0, WI2, 1, 0, 1, 2, new Float64Array( 4 ), 1, 2, 0, WORK, 1, 0 );

	assert.strictEqual( info1, info2, 'info matches' );
	assert.ok( Math.abs( WR1[ 0 ] - WR2[ 0 ] ) < 1e-14 && Math.abs( WR1[ 1 ] - WR2[ 1 ] ) < 1e-14, 'WR matches' );
});

test( 'dlaqr0: WORK = null allocates the reference optimum (ticket 0100)', function t() {
	function run( N, WORK ) {
		const H = new Float64Array( N * N );
		const Z = new Float64Array( N * N );
		const WR = new Float64Array( N );
		const WI = new Float64Array( N );
		let info;
		let i;
		for ( i = 1; i < N; i++ ) {
			H[ i + ( ( i - 1 ) * N ) ] = 1.0;
		}
		H[ ( N - 1 ) * N ] = 1.0;
		for ( i = 0; i < N; i++ ) {
			Z[ i + ( i * N ) ] = 1.0;
		}
		info = dlaqr0( 'column-major', true, true, N, 1, N, H, N, WR, 1, WI, 1, 1, N, Z, N, WORK );
		return {
			'N': N,
			'info': info,
			're': WR,
			'im': WI,
			'out': [].concat( Array.from( WR ), Array.from( WI ), Array.from( H ), Array.from( Z ) )
		};
	}
	function checkRoots( r, msg ) {
		// The cyclic shift's eigenvalues are the N-th roots of unity, each once:
		const seen = new Uint8Array( r.N );
		let k;
		let i;
		assert.equal( r.info, 0, msg + ': info' );
		for ( i = 0; i < r.N; i++ ) {
			k = ( ( Math.round( Math.atan2( r.im[ i ], r.re[ i ] ) * r.N / ( 2.0 * Math.PI ) ) % r.N ) + r.N ) % r.N;
			assert.ok( Math.abs( r.re[ i ] - Math.cos( 2.0 * Math.PI * k / r.N ) ) <= 1e-10 && Math.abs( r.im[ i ] - Math.sin( 2.0 * Math.PI * k / r.N ) ) <= 1e-10, msg + ': eigenvalue ' + i + ' = ' + r.re[ i ] + ' + ' + r.im[ i ] + 'i' );
			assert.equal( seen[ k ], 0, msg + ': root ' + k + ' found twice' );
			seen[ k ] = 1;
		}
	}
	function assertSame( a, b, msg ) {
		let i;
		assert.equal( a.info, b.info, msg + ': info' );
		for ( i = 0; i < a.out.length; i++ ) {
			if ( a.out[ i ] !== b.out[ i ] ) {
				assert.strictEqual( a.out[ i ], b.out[ i ], msg + ': element ' + i );
			}
		}
	}
	const sizes = [ 6, 300 ];
	const optimum = [ 6, 5381 ]; // max( max(1,N), the reference's LWKOPT ) with the JS callees' optima (see base.js)
	let N;
	let r;
	let s;
	for ( s = 0; s < sizes.length; s++ ) {
		N = sizes[ s ];
		r = run( N, null );
		checkRoots( r, 'null, N = ' + N );
		assertSame( r, run( N, new Float64Array( optimum[ s ] ) ), 'null vs optimum, N = ' + N );

		// A larger WORK lets the stalled window's callees keep NB = 32 (a different, equally valid Schur form):
		checkRoots( run( N, new Float64Array( 100 * N ) ), '100*N, N = ' + N );
	}
});
