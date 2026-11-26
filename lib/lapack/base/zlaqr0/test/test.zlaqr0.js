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

test( 'zlaqr0: WORK = null allocates the reference optimum (ticket 0100)', function t() {
	function run( N, WORK ) {
		const H = new Complex128Array( N * N );
		const Z = new Complex128Array( N * N );
		const w = new Complex128Array( N );
		const hv = reinterpret( H, 0 );
		const zv = reinterpret( Z, 0 );
		const wv = reinterpret( w, 0 );
		const re = [];
		const im = [];
		let info;
		let i;
		for ( i = 1; i < N; i++ ) {
			hv[ 2 * ( i + ( ( i - 1 ) * N ) ) ] = 1.0;
		}
		hv[ 2 * ( N - 1 ) * N ] = 1.0;
		for ( i = 0; i < N; i++ ) {
			zv[ 2 * ( i + ( i * N ) ) ] = 1.0;
		}
		info = zlaqr0( 'column-major', true, true, N, 1, N, H, N, w, 1, 1, N, Z, N, WORK );
		for ( i = 0; i < N; i++ ) {
			re.push( wv[ 2 * i ] );
			im.push( wv[ ( 2 * i ) + 1 ] );
		}
		return {
			'N': N,
			'info': info,
			're': re,
			'im': im,
			'out': [].concat( Array.from( wv ), Array.from( hv ), Array.from( zv ) )
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
	const sizes = [ 6, 120 ];
	const optimum = [ 6, 4358 ]; // max( max(1,N), the reference's LWKOPT ) with the JS callees' optima (see base.js)
	let N;
	let r;
	let s;
	for ( s = 0; s < sizes.length; s++ ) {
		N = sizes[ s ];
		r = run( N, null );
		checkRoots( r, 'null, N = ' + N );
		assertSame( r, run( N, new Complex128Array( optimum[ s ] ) ), 'null vs optimum, N = ' + N );

		// A larger WORK lets the stalled window's callees keep NB = 32 (a different, equally valid Schur form):
		checkRoots( run( N, new Complex128Array( 100 * N ) ), '100*N, N = ' + N );
	}
});
