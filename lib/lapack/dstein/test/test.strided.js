/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dstein from './../lib/strided.js';
import dstebz from './../../dstebz/lib/strided.js';

// FIXTURES //

import basic_5x5_all from './fixtures/basic_5x5_all.json' with { type: 'json' };
import partial_2of5 from './fixtures/partial_2of5.json' with { type: 'json' };
import two_blocks from './fixtures/two_blocks.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Extract column j (0-based) from column-major flat array with N rows.
*/
function getColumn( flat, N, j ) {
	const col = new Float64Array( N );
	let i;
	for ( i = 0; i < N; i++ ) {
		col[ i ] = flat[ j * N + i ];
	}
	return col;
}

/**
* Compute dot product of two arrays.
*/
function dot( a, b ) {
	let s = 0.0;
	let i;
	for ( i = 0; i < a.length; i++ ) {
		s += a[ i ] * b[ i ];
	}
	return s;
}

/**
* Check orthogonality of eigenvectors: Z^T * Z should be identity.
*/
function checkOrthogonality( Zflat, N, M, tol ) {
	let expected, ci, cj, v, i, j;
	for ( i = 0; i < M; i++ ) {
		ci = getColumn( Zflat, N, i );
		for ( j = i; j < M; j++ ) {
			cj = getColumn( Zflat, N, j );
			v = dot( ci, cj );
			expected = ( i === j ) ? 1.0 : 0.0;
			assertClose( v, expected, tol, 'Z(:,' + i + ')^T * Z(:,' + j + ')' );
		}
	}
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dstein: basic 5x5, all eigenvectors', function t() {
	let i, j;

	const tc = basic_5x5_all;
	const N = 5;
	const M = 5;
	const d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0, 2.0 ] );
	const e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const w = new Float64Array( tc.w );
	const IBLOCK = new Int32Array( tc.iblock );
	const ISPLIT = new Int32Array( tc.isplit );
	const Z = new Float64Array( N * M );
	const WORK = new Float64Array( 5 * N );
	const IWORK = new Int32Array( N );
	const IFAIL = new Int32Array( M );
	const info = dstein( N, d, 1, 0, e, 1, 0, M, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, 1, N, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IFAIL ), [ 0, 0, 0, 0, 0 ], 'ifail' );
	checkOrthogonality( Z, N, M, 1e-12 );
	for ( j = 0; j < M; j++ ) {
		const colActual = getColumn( Z, N, j );
		const colExpected = getColumn( tc.Z, N, j );

		// Determine sign: compare first significant element
		let sign = 1.0;
		for ( i = 0; i < N; i++ ) {
			if ( Math.abs( colExpected[ i ] ) > 1e-10 ) {
				sign = ( colActual[ i ] * colExpected[ i ] > 0 ) ? 1.0 : -1.0;
				break;
			}
		}
		for ( i = 0; i < N; i++ ) {
			assertClose( colActual[ i ] * sign, colExpected[ i ], 1e-12, 'Z[' + i + ',' + j + ']' ); // eslint-disable-line max-len
		}
	}
});

test( 'dstein: partial 2 of 5 eigenvectors', function t() {

	const tc = partial_2of5;
	const N = 5;
	const M = 2;
	const d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0, 2.0 ] );
	const e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const w = new Float64Array( tc.w );
	const IBLOCK = new Int32Array( [ 1, 1 ] );
	const ISPLIT = new Int32Array( [ 5 ] );
	const Z = new Float64Array( N * M );
	const WORK = new Float64Array( 5 * N );
	const IWORK = new Int32Array( N );
	const IFAIL = new Int32Array( M );
	const info = dstein( N, d, 1, 0, e, 1, 0, M, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, 1, N, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IFAIL ), [ 0, 0 ], 'ifail' );
	checkOrthogonality( Z, N, M, 1e-12 );
});

test( 'dstein: N=1', function t() {

	const N = 1;
	const M = 1;
	const d = new Float64Array( [ 3.0 ] );
	const e = new Float64Array( 0 );
	const w = new Float64Array( [ 3.0 ] );
	const IBLOCK = new Int32Array( [ 1 ] );
	const ISPLIT = new Int32Array( [ 1 ] );
	const Z = new Float64Array( 1 );
	const WORK = new Float64Array( 5 );
	const IWORK = new Int32Array( 1 );
	const IFAIL = new Int32Array( 1 );
	const info = dstein( N, d, 1, 0, e, 1, 0, M, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, 1, 1, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertClose( Z[ 0 ], 1.0, 1e-14, 'Z[0]' );
});

test( 'dstein: N=0', function t() {

	const d = new Float64Array( 0 );
	const e = new Float64Array( 0 );
	const w = new Float64Array( 0 );
	const IBLOCK = new Int32Array( 0 );
	const ISPLIT = new Int32Array( 0 );
	const Z = new Float64Array( 0 );
	const WORK = new Float64Array( 0 );
	const IWORK = new Int32Array( 0 );
	const IFAIL = new Int32Array( 0 );
	const info = dstein( 0, d, 1, 0, e, 1, 0, 0, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, 1, 0, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dstein: two blocks', function t() {
	let i, j;

	const tc = two_blocks;
	const N = 5;
	const M = 5;
	const d = new Float64Array( [ 4.0, 4.0, 4.0, 3.0, 3.0 ] );
	const e = new Float64Array( [ 1.0, 1.0, 0.0, 0.5 ] );
	const w = new Float64Array( tc.w );
	const IBLOCK = new Int32Array( tc.iblock );
	const ISPLIT = new Int32Array( tc.isplit );
	const Z = new Float64Array( N * M );
	const WORK = new Float64Array( 5 * N );
	const IWORK = new Int32Array( N );
	const IFAIL = new Int32Array( M );
	const info = dstein( N, d, 1, 0, e, 1, 0, M, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, 1, N, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IFAIL ), [ 0, 0, 0, 0, 0 ], 'ifail' );
	checkOrthogonality( Z, N, 3, 1e-12 );
	for ( j = 0; j < 3; j++ ) {
		for ( i = 3; i < 5; i++ ) {
			assertClose( Z[ j * N + i ], 0.0, 1e-14, 'Z[' + i + ',' + j + '] should be zero' ); // eslint-disable-line max-len
		}
	}
	for ( j = 3; j < 5; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			assertClose( Z[ j * N + i ], 0.0, 1e-14, 'Z[' + i + ',' + j + '] should be zero' ); // eslint-disable-line max-len
		}
	}
});

test( 'dstein: non-converged eigenvector is still normalized (label 100 falls through to 110)', function t() {
	// A 2x2 block with norm 1e-300: every scaled iterate stays below the stopping criterion, so after MAXITS iterations INFO = 1, IFAIL(1) = 1, and the Fortran still normalizes the last iterate.
	const Z = new Float64Array( 4 );
	const IFAIL = new Int32Array( 1 );
	const info = dstein( 2, new Float64Array( [ 0.0, 0.0 ] ), 1, 0, new Float64Array( [ 1e-300 ] ), 1, 0, 1, new Float64Array( [ 0.0 ] ), 1, 0, new Int32Array( [ 1 ] ), 1, 0, new Int32Array( [ 2 ] ), 1, 0, Z, 1, 2, 0, new Float64Array( 10 ), 1, 0, new Int32Array( 2 ), 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 1, 'info' );
	assert.equal( IFAIL[ 0 ], 1, 'IFAIL' );
	assert.ok( Math.abs( Math.hypot( Z[ 0 ], Z[ 1 ] ) - 1.0 ) <= 1e-15, 'unit 2-norm: ' + Math.hypot( Z[ 0 ], Z[ 1 ] ) );
});


// PROPERTY TESTS //

/**
* Computes eigenvalues (ORDER = 'block') with dstebz and the corresponding eigenvectors with dstein, and asserts that each converged pair satisfies `T*z = lambda*z` and that the eigenvectors are orthonormal.
*
* @private
* @param {Array<number>} dv - diagonal
* @param {Array<number>} ev - off-diagonal
* @returns {Object} result
*/
function eigenpairs( dv, ev ) {
	const N = dv.length;
	const d = new Float64Array( dv );
	const e = new Float64Array( Math.max( ev.length, 1 ) );
	const nsplit = new Int32Array( 1 );
	const IBLOCK = new Int32Array( N );
	const ISPLIT = new Int32Array( N );
	const IFAIL = new Int32Array( N );
	const Mout = new Int32Array( 1 );
	const w = new Float64Array( N );
	const Z = new Float64Array( N * N );
	let tnorm;
	let info;
	let res;
	let M;
	let s;
	let i;
	let j;
	for ( i = 0; i < ev.length; i++ ) {
		e[ i ] = ev[ i ];
	}
	info = dstebz( 'all', 'block', N, 0.0, 0.0, 1, N, 0.0, d, 1, 0, e, 1, 0, Mout, nsplit, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, new Float64Array( 4 * N ), 1, 0, new Int32Array( 3 * N ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'dstebz info' );
	M = Mout[ 0 ];
	assert.equal( M, N, 'M' );
	info = dstein( N, d, 1, 0, e, 1, 0, M, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, 1, N, 0, new Float64Array( 5 * N ), 1, 0, new Int32Array( N ), 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'dstein info' );
	assert.deepEqual( toArray( IFAIL ), new Array( N ).fill( 0 ), 'IFAIL' );
	tnorm = 0.0;
	for ( i = 0; i < N; i++ ) {
		tnorm = Math.max( tnorm, Math.abs( dv[ i ] ) + ( ( i > 0 ) ? Math.abs( ev[ i - 1 ] ) : 0.0 ) + ( ( i < N - 1 ) ? Math.abs( ev[ i ] ) : 0.0 ) ); // eslint-disable-line max-len
	}
	for ( j = 0; j < M; j++ ) {
		res = 0.0;
		for ( i = 0; i < N; i++ ) {
			s = ( dv[ i ] - w[ j ] ) * Z[ ( j * N ) + i ];
			if ( i > 0 ) {
				s += ev[ i - 1 ] * Z[ ( j * N ) + i - 1 ];
			}
			if ( i < N - 1 ) {
				s += ev[ i ] * Z[ ( j * N ) + i + 1 ];
			}
			res = Math.max( res, Math.abs( s ) );
		}
		assert.ok( res <= 100.0 * N * 2.22e-16 * tnorm, 'residual of pair ' + j + ': ' + res );
	}
	checkOrthogonality( Z, N, M, 1e-12 );
	return {
		'w': w,
		'Z': Z,
		'IBLOCK': IBLOCK
	};
}

test( 'dstein: returns -6 when IBLOCK is not nondecreasing', function t() {
	const IFAIL = new Int32Array( [ 7, 7 ] );
	const info = dstein( 3, new Float64Array( [ 1.0, 2.0, 3.0 ] ), 1, 0, new Float64Array( [ 0.0, 1.0 ] ), 1, 0, 2, new Float64Array( [ 1.0, 2.0 ] ), 1, 0, new Int32Array( [ 2, 1 ] ), 1, 0, new Int32Array( [ 1, 3 ] ), 1, 0, new Float64Array( 6 ), 1, 3, 0, new Float64Array( 15 ), 1, 0, new Int32Array( 3 ), 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, -6, 'info' );
	assert.deepEqual( toArray( IFAIL ), [ 0, 0 ], 'IFAIL is initialized before the check' );
});

test( 'dstein: returns -5 when eigenvalues within a block are decreasing', function t() {
	const info = dstein( 3, new Float64Array( [ 1.0, 2.0, 3.0 ] ), 1, 0, new Float64Array( [ 1.0, 1.0 ] ), 1, 0, 2, new Float64Array( [ 2.0, 1.0 ] ), 1, 0, new Int32Array( [ 1, 1 ] ), 1, 0, new Int32Array( [ 3 ] ), 1, 0, new Float64Array( 6 ), 1, 3, 0, new Float64Array( 15 ), 1, 0, new Int32Array( 3 ), 1, 0, new Int32Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, -5, 'info' );
});

test( 'dstein: singleton blocks yield unit vectors', function t() {
	// Blocks {1}, {2,3}, {4}, {5}.
	const r = eigenpairs( [ 1.0, 2.0, 2.0, 3.0, -1.0 ], [ 0.0, 1.0, 0.0, 0.0 ] );
	assert.deepEqual( toArray( r.IBLOCK ), [ 1, 2, 2, 3, 4 ], 'IBLOCK' );
	assert.equal( r.w[ 0 ], 1.0, 'w[0]' );
	assert.equal( Math.abs( r.Z[ 0 ] ), 1.0, 'Z(1,1)' );
	assert.equal( Math.abs( r.Z[ ( 3 * 5 ) + 3 ] ), 1.0, 'Z(4,4)' );
	assert.equal( Math.abs( r.Z[ ( 4 * 5 ) + 4 ] ), 1.0, 'Z(5,5)' );
});

test( 'dstein: nearly coincident eigenvalues are perturbed and reorthogonalized', function t() {
	// Two copies of the Wilkinson matrix W7+ coupled by an off-diagonal
	// Entry just above the splitting threshold: each eigenvalue of W7+
	// Appears twice, separated by far less than 10*eps*|lambda|.
	const w7 = [ 3.0, 2.0, 1.0, 0.0, 1.0, 2.0, 3.0 ];
	const dv = w7.concat( w7 );
	const ev = [ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0e-14, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ];
	const r = eigenpairs( dv, ev );
	assert.deepEqual( toArray( r.IBLOCK ), new Array( 14 ).fill( 1 ), 'one block' );
});

test( 'dstein: tight cluster in a single block (Gram-Schmidt against the cluster)', function t() {
	// Wilkinson W21+: its largest eigenvalues come in pairs agreeing to
	// About 1e-14 (closer than ORTOL), so later vectors are orthogonalized.
	const dv = [];
	const ev = [];
	let i;
	for ( i = 0; i < 21; i++ ) {
		dv.push( Math.abs( 10 - i ) );
		if ( i < 20 ) {
			ev.push( 1.0 );
		}
	}
	eigenpairs( dv, ev );
});
