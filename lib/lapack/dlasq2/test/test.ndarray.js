/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { importWithConstants } from '../../../../test/harness/constants.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasq2 from './../lib/ndarray.js';

// FIXTURES //

import n0 from './fixtures/n0.json' with { type: 'json' };
import n1 from './fixtures/n1.json' with { type: 'json' };
import n2 from './fixtures/n2.json' with { type: 'json' };
import n2_swap from './fixtures/n2_swap.json' with { type: 'json' };
import n3_basic from './fixtures/n3_basic.json' with { type: 'json' };
import n4_basic from './fixtures/n4_basic.json' with { type: 'json' };
import n3_diagonal from './fixtures/n3_diagonal.json' with { type: 'json' };
import n5_basic from './fixtures/n5_basic.json' with { type: 'json' };
import n3_reversal from './fixtures/n3_reversal.json' with { type: 'json' };
import n4_identity_like from './fixtures/n4_identity_like.json' with { type: 'json' };
import n2_zero_offdiag from './fixtures/n2_zero_offdiag.json' with { type: 'json' };

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
	if ( expected === 0.0 ) {
		assert.ok( Math.abs( actual ) <= tol, msg + ': expected ' + expected + ', got ' + actual ); // eslint-disable-line max-len
		return;
	}
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Creates a Float64Array of given size, optionally initialized from an object.
* mapping 1-based indices to values.
*/
function createZ( size, vals ) {
	const z = new Float64Array( size );
	let k;
	if ( vals ) {
		for ( k = 0; k < vals.length; k++ ) {
			z[ k ] = vals[ k ];
		}
	}
	return z;
}

/**
* Computes the eigenvalues (in decreasing order) of the symmetric tridiagonal matrix `B^T B` associated with a qd array, where `B` is upper bidiagonal with diagonal `sqrt(q)` and superdiagonal `sqrt(e)`, using cyclic Jacobi rotations on the dense matrix (an oracle independent of dqds).
*
* @private
* @param {Array} qe - qd values `[q1, e1, q2, e2, ..., qN]`
* @returns {Array} eigenvalues sorted in decreasing order
*/
function jacobiEigs( qe ) {
	const N = ( qe.length + 1 ) / 2;
	const A = [];
	let akp;
	let akr;
	let sw;
	let th;
	let c;
	let s;
	let t;
	let i;
	let p;
	let r;
	let k;
	for ( i = 0; i < N; i++ ) {
		A.push( new Array( N ).fill( 0.0 ) );
	}
	// (B^T B) is tridiagonal: diag q(i) + e(i-1), offdiag sqrt(q(i)*e(i))
	for ( i = 0; i < N; i++ ) {
		A[ i ][ i ] = qe[ 2 * i ] + ( ( i > 0 ) ? qe[ ( 2 * i ) - 1 ] : 0.0 );
		if ( i < N - 1 ) {
			A[ i ][ i + 1 ] = Math.sqrt( qe[ 2 * i ] * qe[ ( 2 * i ) + 1 ] );
			A[ i + 1 ][ i ] = A[ i ][ i + 1 ];
		}
	}
	for ( sw = 0; sw < 60; sw++ ) {
		for ( p = 0; p < N; p++ ) {
			for ( r = p + 1; r < N; r++ ) {
				if ( Math.abs( A[ p ][ r ] ) < 1e-300 ) {
					continue;
				}
				th = ( A[ r ][ r ] - A[ p ][ p ] ) / ( 2.0 * A[ p ][ r ] );
				t = ( ( th < 0.0 ) ? -1.0 : 1.0 ) / ( Math.abs( th ) + Math.sqrt( ( th * th ) + 1.0 ) ); // eslint-disable-line max-len
				c = 1.0 / Math.sqrt( ( t * t ) + 1.0 );
				s = t * c;
				for ( k = 0; k < N; k++ ) {
					akp = A[ k ][ p ];
					akr = A[ k ][ r ];
					A[ k ][ p ] = ( c * akp ) - ( s * akr );
					A[ k ][ r ] = ( s * akp ) + ( c * akr );
				}
				for ( k = 0; k < N; k++ ) {
					akp = A[ p ][ k ];
					akr = A[ r ][ k ];
					A[ p ][ k ] = ( c * akp ) - ( s * akr );
					A[ r ][ k ] = ( s * akp ) + ( c * akr );
				}
			}
		}
	}
	return A.map( ( row, j ) => row[ j ] ).sort( ( x, y ) => y - x );
}

// TESTS //

test( 'dlasq2: n0 - quick return', function t() {

	const tc = n0;
	const z = createZ( 4 );
	const info = dlasq2( 0, z, 1, 0 );
	assert.strictEqual( info, tc.info );
});

test( 'dlasq2: n1 - single element', function t() {

	const tc = n1;
	const z = createZ( 100, [ 4.0 ] );
	const info = dlasq2( 1, z, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlasq2: n2 - basic 2-by-2', function t() {

	const tc = n2;
	const z = createZ( 100, [ 4.0, 1.0, 3.0 ] );
	const info = dlasq2( 2, z, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlasq2: n2_swap - swap case', function t() {

	const tc = n2_swap;
	const z = createZ( 100, [ 2.0, 1.0, 5.0 ] );
	const info = dlasq2( 2, z, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlasq2: n3_basic', function t() {

	const tc = n3_basic;
	const z = createZ( 100, [ 4.0, 1.0, 3.0, 0.5, 2.0 ] );
	const info = dlasq2( 3, z, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlasq2: n4_basic', function t() {

	const tc = n4_basic;
	const z = createZ( 100, [ 4.0, 1.0, 3.0, 0.5, 5.0, 0.3, 2.0 ] );
	const info = dlasq2( 4, z, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlasq2: n3_diagonal - all off-diag zero', function t() {

	const tc = n3_diagonal;
	const z = createZ( 100, [ 4.0, 0.0, 3.0, 0.0, 2.0 ] );
	const info = dlasq2( 3, z, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlasq2: n5_basic', function t() {

	const tc = n5_basic;
	const z = createZ( 100, [ 9.0, 1.0, 8.0, 0.5, 7.0, 0.3, 6.0, 0.2, 5.0 ] );
	const info = dlasq2( 5, z, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlasq2: n3_reversal - triggers reversal', function t() {

	const tc = n3_reversal;
	const z = createZ( 100, [ 1.0, 0.5, 2.0, 0.3, 10.0 ] );
	const info = dlasq2( 3, z, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlasq2: n4_identity_like', function t() {

	const tc = n4_identity_like;
	const z = createZ( 100, [ 1.0, 0.1, 1.0, 0.1, 1.0, 0.1, 1.0 ] );
	const info = dlasq2( 4, z, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlasq2: n2_zero_offdiag', function t() {

	const tc = n2_zero_offdiag;
	const z = createZ( 100, [ 4.0, 0.0, 3.0 ] );
	const info = dlasq2( 2, z, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

// Error cases (not in Fortran fixtures, but test JS behavior)
test( 'dlasq2: throws RangeError for N<0', function t() {
	const z = createZ( 4 );
	assert.throws( function() {
		dlasq2( -1, z, 1, 0 );
	}, RangeError );
});

test( 'dlasq2: N=1 negative z returns -201', function t() {

	const z = createZ( 100, [ -1.0 ] );
	const info = dlasq2( 1, z, 1, 0 );
	assert.strictEqual( info, -201 );
});

test( 'dlasq2: N=2 negative z(2) returns -202', function t() {

	const z = createZ( 100, [ 4.0, -1.0, 3.0 ] );
	const info = dlasq2( 2, z, 1, 0 );
	assert.strictEqual( info, -202 );
});

test( 'dlasq2: N=2 negative z(3) returns -203', function t() {

	const z = createZ( 100, [ 4.0, 1.0, -3.0 ] );
	const info = dlasq2( 2, z, 1, 0 );
	assert.strictEqual( info, -203 );
});

test( 'dlasq2: N=2 negative z(1) returns -201', function t() {

	const z = createZ( 100, [ -4.0, 1.0, 3.0 ] );
	const info = dlasq2( 2, z, 1, 0 );
	assert.strictEqual( info, -201 );
});

test( 'dlasq2: N=2 s>t branch', function t() {

	const z = createZ( 100, [ 1.0, 10.0, 1.0 ] );
	const info = dlasq2( 2, z, 1, 0 );
	assert.strictEqual( info, 0 );
	assertClose( z[ 0 ], 11.916079783099615, 1e-14, 'd[0]' );
	assertClose( z[ 1 ], 0.08392021690038397, 1e-14, 'd[1]' );
});

test( 'dlasq2: N>=3 negative diagonal returns error', function t() {

	const z = createZ( 100, [ 4.0, 1.0, -3.0, 0.5, 2.0 ] );
	const info = dlasq2( 3, z, 1, 0 );
	assert.strictEqual( info, -203 );
});

test( 'dlasq2: N>=3 negative off-diagonal returns error', function t() {

	const z = createZ( 100, [ 4.0, -1.0, 3.0, 0.5, 2.0 ] );
	const info = dlasq2( 3, z, 1, 0 );
	assert.strictEqual( info, -202 );
});

test( 'dlasq2: N>=3 negative last diagonal returns error', function t() {

	const z = createZ( 100, [ 4.0, 1.0, 3.0, 0.5, -2.0 ] );
	const info = dlasq2( 3, z, 1, 0 );
	assert.strictEqual( info, -205 );
});

test( 'dlasq2: n5_split - matrix with zero off-diagonal (split)', function t() {

	const z = createZ( 100, [ 9.0, 1.0, 8.0, 0.0, 7.0, 0.5, 6.0, 0.3, 5.0 ] );
	const info = dlasq2( 5, z, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( z[ 0 ] >= z[ 1 ], 'd[0] >= d[1]' );
	assert.ok( z[ 1 ] >= z[ 2 ], 'd[1] >= d[2]' );
});

test( 'dlasq2: n3_tiny_offdiag - nearly diagonal', function t() {

	const z = createZ( 100, [ 4.0, 1e-20, 3.0, 1e-20, 2.0 ] );
	const info = dlasq2( 3, z, 1, 0 );
	assert.strictEqual( info, 0 );
	assertClose( z[ 0 ], 4.0, 1e-10, 'd[0]' );
	assertClose( z[ 1 ], 3.0, 1e-10, 'd[1]' );
	assertClose( z[ 2 ], 2.0, 1e-10, 'd[2]' );
});

test( 'dlasq2: n4_ascending - ascending diagonals trigger aggressive dqds', function t() { // eslint-disable-line max-len

	const z = createZ( 100, [ 1.0, 0.5, 1.0, 0.5, 1.0, 0.5, 10.0 ] );
	const info = dlasq2( 4, z, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( z[ 0 ] >= z[ 1 ], 'd[0] >= d[1]' );
});

test( 'dlasq2: n8_ascending - ascending pattern for aggressive dqds', function t() { // eslint-disable-line max-len

	const z = createZ( 200, [
		0.1,
		0.5,
		0.2,
		0.5,
		0.3,
		0.5,
		0.5,
		0.5,
		1.0,
		0.5,
		2.0,
		0.5,
		5.0,
		0.5,
		10.0
	]);
	const info = dlasq2( 8, z, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( z[ 0 ] >= z[ 1 ], 'd[0] >= d[1]' );
});

test( 'dlasq2: n10_ascending - larger ascending for aggressive dqds reversal', function t() { // eslint-disable-line max-len
	let i;

	const vals = [];
	for ( i = 0; i < 9; i++ ) {
		vals.push( ( i + 1 ) * 0.01 );
		vals.push( 0.01 );
	}
	vals.push( 100.0 );
	const z = createZ( 200, vals );
	const info = dlasq2( 10, z, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( z[ 0 ] >= z[ 1 ], 'd[0] >= d[1]' );
});

test( 'dlasq2: n6_tiny_then_large - triggers aggressive dqds pp=2 reversal', function t() { // eslint-disable-line max-len

	const z = createZ( 200, [ 0.001, 0.1, 0.001, 0.1, 0.001, 0.1, 0.001, 0.1, 0.001, 0.1, 100.0 ] ); // eslint-disable-line max-len
	const info = dlasq2( 6, z, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( z[ 0 ] >= z[ 1 ], 'd[0] >= d[1]' );
});

test( 'dlasq2: n8_graded - graded matrix for aggressive dqds', function t() {

	const z = createZ( 200, [
		1e-8,
		1e-4,
		1e-6,
		1e-4,
		1e-4,
		1e-4,
		1e-2,
		1e-4,
		1.0,
		1e-4,
		1e2,
		1e-4,
		1e4,
		1e-4,
		1e6
	]);
	const info = dlasq2( 8, z, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( z[ 0 ] >= z[ 1 ], 'd[0] >= d[1]' );
});

test( 'dlasq2: mid-iteration split (negligible interior e) restarts at the split block, not at row 1', function t() {
	// Interior e's of 1e-200 are not removed by the initial dqd split check, but become negligible during dqds, so the split loop marks them with -SIGMA. On the next outer pass, the scan for the last unreduced block must stop at that marker (I0 = I4/4 > 1); restarting from row 1 would run dqds across the negative marker and corrupt the eigenvalues.
	const qe = [ 3.0, 1e-200, 3.0, 4.0, 9.0, 1.0, 7.0, 2.0, 5.0, 1e-200, 9.0, 5.0, 10.0, 1.0, 3.0 ]; // eslint-disable-line max-len
	const expected = jacobiEigs( qe );
	const z = createZ( 32, qe );
	let trace = 0.0;
	let i;
	const info = dlasq2( 8, z, 1, 0 );
	assert.strictEqual( info, 0 );
	for ( i = 0; i < qe.length; i++ ) {
		trace += qe[ i ];
	}
	for ( i = 0; i < 8; i++ ) {
		assertClose( z[ i ], expected[ i ], 1e-13, 'eig[' + i + ']' );
		assert.ok( z[ i ] > 0.0, 'eig[' + i + '] positive' );
	}
	// The isolated 1-by-1 block contributes its q exactly (up to rounding).
	assertClose( z[ 5 ], 3.0, 1e-14, 'isolated q' );
	assertClose( z[ 16 ], trace, 1e-14, 'trace' );
	assertClose( z[ 17 ], trace, 1e-13, 'sum of eigenvalues' );
});

// The INFO = 2 exit (dqds iteration limit) cannot be reached by any known
// input, so the limit is set to 0 (test/harness/constants.js; ticket
// 0051). On that exit the reference "restore[s] the shift SIGMA and
// place[s] the new d's and e's in a qd array" (label 145), so its output is
// itself a valid input. Restarting from it must give the original
// eigenvalues.
test( 'dlasq2: the iteration-limit exit (INFO = 2) leaves a restartable qd array', async function t() {
	const mod = await importWithConstants( new URL( './../lib/base.js', import.meta.url ), { 'NBIG_FACTOR': 0 } );
	const qe = [ 3.0, 1.0, 4.0, 0.5, 2.0, 1.0, 5.0, 0.25, 1.0 ];
	const N = 5;
	const z = createZ( 4 * N, qe );
	const info = mod.default( N, z, 1, 0 );
	let restart;
	let info2;
	let want;
	let i;
	assert.equal( info, 2, 'info' );
	restart = createZ( 4 * N, Array.from( z.slice( 0, ( 2 * N ) - 1 ) ) );
	info2 = dlasq2( N, restart, 1, 0 );
	assert.equal( info2, 0, 'restart info' );
	want = jacobiEigs( qe );
	for ( i = 0; i < N; i++ ) {
		assertClose( restart[ i ], want[ i ], 1e-12, 'eigenvalue ' + i + ' after restart' );
	}
});
