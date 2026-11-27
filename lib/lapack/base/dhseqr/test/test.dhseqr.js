/* eslint-disable no-restricted-syntax */

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

test( 'dhseqr: work = null allocates the reference optimum (ticket 0100)', function t() {
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
		info = dhseqr( 'column-major', 'schur', 'update', N, 1, N, H, N, WR, 1, WI, 1, Z, N, WORK );
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
	const sizes = [ 300 ];
	const optimum = [ 5381 ]; // max( max(1,N), the reference's LWKOPT ) with the JS callees' optima (see base.js)
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
