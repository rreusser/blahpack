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

test( 'zhseqr: WORK = null allocates the reference optimum (ticket 0100)', function t() {
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
		info = zhseqr( 'column-major', 'schur', 'update', N, 1, N, H, N, w, 1, Z, N, WORK );
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
	const sizes = [ 120 ];
	const optimum = [ 4358 ]; // max( max(1,N), the reference's LWKOPT ) with the JS callees' optima (see base.js)
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
