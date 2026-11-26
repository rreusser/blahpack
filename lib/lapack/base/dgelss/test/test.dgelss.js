/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgelss from './../lib/dgelss.js';
import { computeMinWorkSize } from './../lib/base.js';


// TESTS //

test( 'dgelss is a function', function t() {
	assert.strictEqual( typeof dgelss, 'function', 'is a function' );
});

test( 'dgelss has expected arity', function t() {
	assert.strictEqual( dgelss.length, 13, 'has expected arity' );
});

test( 'dgelss throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgelss( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dgelss throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgelss( 'row-major', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dgelss throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgelss( 'row-major', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dgelss throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dgelss( 'row-major', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dgelss row-major, overdetermined (M>N): throws RangeError when LDB < nrhs', function t() {
	assert.throws( function throws() {
		dgelss( 'row-major', 3, 2, 2, new Float64Array( 6 ), 2, new Float64Array( 6 ), 1, new Float64Array( 2 ), 1, -1.0, [ 0 ], null );
	}, RangeError );
});

test( 'dgelss row-major, underdetermined (M<N): throws RangeError when LDB < nrhs', function t() {
	assert.throws( function throws() {
		dgelss( 'row-major', 2, 4, 2, new Float64Array( 8 ), 4, new Float64Array( 8 ), 1, new Float64Array( 2 ), 1, -1.0, [ 0 ], null );
	}, RangeError );
});

test( 'dgelss row-major, underdetermined (M<N): does not throw when LDB === nrhs even though nrhs < N', function t() {
	assert.doesNotThrow( function notThrows() {
		dgelss( 'row-major', 2, 4, 2, new Float64Array( 8 ), 4, new Float64Array( 8 ), 2, new Float64Array( 2 ), 1, -1.0, [ 0 ], new Float64Array( 200 ) );
	});
});

test( 'dgelss column-major, overdetermined (M>N): throws RangeError when LDB < max(M,N)', function t() {
	assert.throws( function throws() {
		dgelss( 'column-major', 4, 2, 1, new Float64Array( 8 ), 4, new Float64Array( 8 ), 3, new Float64Array( 2 ), 1, -1.0, [ 0 ], null );
	}, RangeError );
});

test( 'dgelss column-major, underdetermined (M<N): throws RangeError when LDB < max(M,N)', function t() {
	assert.throws( function throws() {
		dgelss( 'column-major', 2, 4, 1, new Float64Array( 8 ), 2, new Float64Array( 8 ), 3, new Float64Array( 2 ), 1, -1.0, [ 0 ], null );
	}, RangeError );
});

test( 'dgelss column-major, underdetermined (M<N): does not throw when LDB === max(M,N)', function t() {
	assert.doesNotThrow( function notThrows() {
		dgelss( 'column-major', 2, 4, 1, new Float64Array( 8 ), 2, new Float64Array( 8 ), 4, new Float64Array( 2 ), 1, -1.0, [ 0 ], new Float64Array( 200 ) );
	});
});

test( 'dgelss row-major, underdetermined 2x4: numeric correctness with LDB=nrhs', function t() {
	const A = new Float64Array( [ 1, 0, 0, 0, 0, 1, 0, 0 ] ); // row-major, LDA=4
	const B = new Float64Array( [ 1, 2, 0, 0 ] ); // row-major, LDB=nrhs=1
	const S = new Float64Array( 2 );
	const WORK = new Float64Array( 200 );
	const rank = [ 0 ];
	const info = dgelss( 'row-major', 2, 4, 1, A, 4, B, 1, S, 1, -1.0, rank, WORK );
	const expected = [ 1, 2, 0, 0 ];
	let i;
	assert.equal( info, 0, 'info' );
	assert.equal( rank[ 0 ], 2, 'rank' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( B[ i ] - expected[ i ] ) < 1e-9, 'B[' + i + ']' );
	}
});

test( 'dgelss column-major, underdetermined 2x4: numeric correctness with LDB=max(M,N)', function t() {
	const A = new Float64Array( [ 1, 0, 0, 1, 0, 0, 0, 0 ] ); // column-major, LDA=2
	const B = new Float64Array( [ 1, 2, 0, 0 ] ); // column-major, LDB=max(M,N)=4
	const S = new Float64Array( 2 );
	const WORK = new Float64Array( 200 );
	const rank = [ 0 ];
	const info = dgelss( 'column-major', 2, 4, 1, A, 2, B, 4, S, 1, -1.0, rank, WORK );
	const expected = [ 1, 2, 0, 0 ];
	let i;
	assert.equal( info, 0, 'info' );
	assert.equal( rank[ 0 ], 2, 'rank' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( B[ i ] - expected[ i ] ) < 1e-9, 'B[' + i + ']' );
	}
});

test( 'dgelss: null WORK, 4x5 underdetermined (N < MNTHR: direct bidiagonal path), column-major and row-major agree and solve A*X = B', function t() {
	const M = 4;
	const N = 5;
	const nrhs = 2;
	const Ac = new Float64Array( M * N );
	const Ar = new Float64Array( M * N );
	const Bc = new Float64Array( N * nrhs );
	const Br = new Float64Array( N * nrhs );
	const A0 = [];
	const B0 = [];
	const Sc = new Float64Array( M );
	const Sr = new Float64Array( M );
	const rc = [ 0 ];
	const rr = [ 0 ];
	let info;
	let sum;
	let i;
	let j;
	let k;
	for ( i = 0; i < M; i++ ) {
		A0.push( [] );
		for ( j = 0; j < N; j++ ) {
			A0[ i ].push( ( ( ( ( i * N ) + j ) * 7 ) % 11 ) - 5 + ( ( i === j ) ? 10 : 0 ) );
			Ac[ i + ( j * M ) ] = A0[ i ][ j ];
			Ar[ ( i * N ) + j ] = A0[ i ][ j ];
		}
		B0.push( [ i + 1, ( 2 * i ) - 3 ] );
		for ( k = 0; k < nrhs; k++ ) {
			Bc[ i + ( k * N ) ] = B0[ i ][ k ];
			Br[ ( i * nrhs ) + k ] = B0[ i ][ k ];
		}
	}
	info = dgelss( 'column-major', M, N, nrhs, Ac, M, Bc, N, Sc, 1, -1.0, rc, null );
	assert.equal( info, 0, 'column-major info' );
	info = dgelss( 'row-major', M, N, nrhs, Ar, N, Br, nrhs, Sr, 1, -1.0, rr, null );
	assert.equal( info, 0, 'row-major info' );
	assert.equal( rc[ 0 ], M, 'column-major rank' );
	assert.equal( rr[ 0 ], M, 'row-major rank' );
	for ( i = 0; i < M; i++ ) {
		assert.ok( Math.abs( Sc[ i ] - Sr[ i ] ) <= 1e-13 * Sc[ 0 ], 'S[' + i + ']' );
	}
	for ( k = 0; k < nrhs; k++ ) {
		for ( j = 0; j < N; j++ ) {
			assert.ok( Math.abs( Bc[ j + ( k * N ) ] - Br[ ( j * nrhs ) + k ] ) <= 1e-13, 'X[' + j + ',' + k + ']' );
		}
		for ( i = 0; i < M; i++ ) {
			sum = 0.0;
			for ( j = 0; j < N; j++ ) {
				sum += A0[ i ][ j ] * Bc[ j + ( k * N ) ];
			}
			assert.ok( Math.abs( sum - B0[ i ][ k ] ) <= 1e-12, '(A*X)[' + i + ',' + k + ']' );
		}
	}
});

test( 'dgelss: a caller WORK one element short of the reference minimum throws RangeError through the wrapper (CONVENTIONS D5d; ticket 0077)', function t() {
	const min = computeMinWorkSize( 4, 3, 1 );
	const A = new Float64Array( [ 1, 2, 3, 4, 2, 1, 0, 1, 0, 1, 1, 3 ] );
	assert.throws( function throws() {
		dgelss( 'column-major', 4, 3, 1, A.slice(), 4, new Float64Array( 4 ), 4, new Float64Array( 3 ), 1, -1, new Int32Array( 1 ), new Float64Array( min - 1 ) );
	}, new RegExp( 'WORK array must have at least ' + min + ' elements' ) );
	assert.strictEqual( dgelss( 'column-major', 4, 3, 1, A.slice(), 4, new Float64Array( 4 ), 4, new Float64Array( 3 ), 1, -1, new Int32Array( 1 ), new Float64Array( min ) ), 0, 'the minimum suffices' );
});
