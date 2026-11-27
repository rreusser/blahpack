/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasq1 from './../lib/ndarray.js';
import { importWithDependencies } from './../../../../../test/harness/constants.js';

// FIXTURES //

import n1 from './fixtures/n1.json' with { type: 'json' };
import n1_neg from './fixtures/n1_neg.json' with { type: 'json' };
import n2 from './fixtures/n2.json' with { type: 'json' };
import n2_neg from './fixtures/n2_neg.json' with { type: 'json' };
import n3_basic from './fixtures/n3_basic.json' with { type: 'json' };
import n4_basic from './fixtures/n4_basic.json' with { type: 'json' };
import n3_diag from './fixtures/n3_diag.json' with { type: 'json' };
import n5_basic from './fixtures/n5_basic.json' with { type: 'json' };
import n2_diag from './fixtures/n2_diag.json' with { type: 'json' };
import n3_neg_large_e from './fixtures/n3_neg_large_e.json' with { type: 'json' };
import n4_identity_like from './fixtures/n4_identity_like.json' with { type: 'json' };

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

// TESTS //

test( 'dlasq1: n0 - quick return', function t() {

	const work = new Float64Array( 4 );
	const d = new Float64Array( 1 );
	const e = new Float64Array( 1 );
	const info = dlasq1( 0, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'dlasq1: n1 - single positive diagonal', function t() {

	const tc = n1;
	const work = new Float64Array( 4 );
	const d = new Float64Array( [ 5.0 ] );
	const e = new Float64Array( 1 );
	const info = dlasq1( 1, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dlasq1: n1_neg - single negative diagonal (abs)', function t() {

	const tc = n1_neg;
	const work = new Float64Array( 4 );
	const d = new Float64Array( [ -3.0 ] );
	const e = new Float64Array( 1 );
	const info = dlasq1( 1, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dlasq1: n2 - two elements', function t() {

	const tc = n2;
	const work = new Float64Array( 8 );
	const d = new Float64Array( [ 4.0, 3.0 ] );
	const e = new Float64Array( [ 1.0 ] );
	const info = dlasq1( 2, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dlasq1: n2_neg - two negative diagonals', function t() {

	const tc = n2_neg;
	const work = new Float64Array( 8 );
	const d = new Float64Array( [ -4.0, -3.0 ] );
	const e = new Float64Array( [ 2.0 ] );
	const info = dlasq1( 2, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dlasq1: n3_basic', function t() {

	const tc = n3_basic;
	const work = new Float64Array( 100 );
	const d = new Float64Array( [ 4.0, 3.0, 2.0 ] );
	const e = new Float64Array( [ 1.0, 0.5 ] );
	const info = dlasq1( 3, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dlasq1: n4_basic', function t() {

	const tc = n4_basic;
	const work = new Float64Array( 100 );
	const d = new Float64Array( [ 5.0, 4.0, 3.0, 2.0 ] );
	const e = new Float64Array( [ 1.0, 0.5, 0.3 ] );
	const info = dlasq1( 4, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dlasq1: n3_diag - diagonal matrix (all e=0)', function t() {

	const tc = n3_diag;
	const work = new Float64Array( 100 );
	const d = new Float64Array( [ 1.0, 5.0, 3.0 ] );
	const e = new Float64Array( [ 0.0, 0.0 ] );
	const info = dlasq1( 3, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dlasq1: n5_basic', function t() {

	const tc = n5_basic;
	const work = new Float64Array( 100 );
	const d = new Float64Array( [ 6.0, 5.0, 4.0, 3.0, 2.0 ] );
	const e = new Float64Array( [ 1.0, 0.8, 0.5, 0.3 ] );
	const info = dlasq1( 5, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dlasq1: n2_diag - diagonal N=2 (e=0)', function t() {

	const tc = n2_diag;
	const work = new Float64Array( 100 );
	const d = new Float64Array( [ 3.0, 7.0 ] );
	const e = new Float64Array( [ 0.0 ] );
	const info = dlasq1( 2, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dlasq1: n3_neg_large_e', function t() {

	const tc = n3_neg_large_e;
	const work = new Float64Array( 100 );
	const d = new Float64Array( [ -3.0, -5.0, -2.0 ] );
	const e = new Float64Array( [ 4.0, 3.0 ] );
	const info = dlasq1( 3, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dlasq1: n4_identity_like', function t() {

	const tc = n4_identity_like;
	const work = new Float64Array( 100 );
	const d = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const e = new Float64Array( [ 0.01, 0.01, 0.01 ] );
	const info = dlasq1( 4, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

// Error case: negative N
test( 'dlasq1: throws RangeError for N<0', function t() {
	const work = new Float64Array( 4 );
	const d = new Float64Array( 1 );
	const e = new Float64Array( 1 );
	assert.throws( function() {
		dlasq1( -1, d, 1, 0, e, 1, 0, work, 1, 0 );
	}, RangeError );
});

test( 'dlasq1 (base): returns -1 for N<0 (reference INFO = -1)', async function t() {
	const base = ( await import( './../lib/base.js' ) ).default;
	const d = new Float64Array( [ 7.0 ] );
	const info = base( -1, d, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 4 ), 1, 0 );
	assert.strictEqual( info, -1 );
	assert.strictEqual( d[ 0 ], 7.0, 'd untouched' );
});

test( 'dlasq1: when dlasq2 returns INFO=2, D and E are recovered from the unscaled qd array (reference DLASQ1 INFO.EQ.2 branch)', async function t() {
	// Stub DLASQ2 to report non-convergence (INFO = 2) without touching the qd array. Per dlasq1.f, D(I) = SQRT(WORK(2I-1)), E(I) = SQRT(WORK(2I)) and both are unscaled from SCALE back to SIGMX. Since WORK held the squared, SIGMX->SCALE-scaled |d| and |e|, the round trip must return |d| and |e| (up to rounding) and propagate INFO = 2.
	let seenN = -1;
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../dlasq2/lib/base.js': function failingDlasq2( N ) {
			seenN = N;
			return 2;
		}
	});
	const d = new Float64Array( [ -3.0, 5.0, -2.0, 0.5 ] );
	const e = new Float64Array( [ 4.0, -1.5, 0.25, 99.0 ] );
	const work = new Float64Array( 16 );
	const info = mod.default( 4, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, 2, 'info propagated' );
	assert.strictEqual( seenN, 4, 'dlasq2 called with N' );
	assertArrayClose( d, [ 3.0, 5.0, 2.0, 0.5 ], 1e-14, 'd' );
	// E(N) = SQRT( WORK( 2N ) ) = 0, since DLASQ1 sets WORK( 2N ) = ZERO:
	// (exactly: a stale E(N) would be rescaled by SIGMX/SCALE ~ 1e-145, which an absolute tolerance hides)
	assertArrayClose( Array.from( e ), [ 4.0, 1.5, 0.25, 0.0 ], 1e-14, 'e' );
	assert.strictEqual( e[ 3 ], 0.0, 'E(N)' );

	// Strided/offset layout gives the same result:
	const ds = new Float64Array( [ NaN, -3.0, NaN, 5.0, NaN, -2.0, NaN, 0.5 ] );
	const es = new Float64Array( [ NaN, NaN, 4.0, NaN, -1.5, NaN, 0.25, NaN, 99.0 ] );
	const ws = new Float64Array( 40 );
	assert.strictEqual( mod.default( 4, ds, 2, 1, es, 2, 2, ws, 2, 3 ), 2 );
	assertArrayClose( [ ds[ 1 ], ds[ 3 ], ds[ 5 ], ds[ 7 ] ], [ 3.0, 5.0, 2.0, 0.5 ], 1e-14, 'd strided' );
	assertArrayClose( [ es[ 2 ], es[ 4 ], es[ 6 ], es[ 8 ] ], [ 4.0, 1.5, 0.25, 0.0 ], 1e-14, 'e strided' );
	assert.strictEqual( es[ 8 ], 0.0, 'E(N) strided' );
});

test( 'dlasq1: when dlasq2 returns INFO=1 (or 3), D and E are left as the absolute input values', async function t() {
	// Reference DLASQ1 handles only INFO.EQ.0 and INFO.EQ.2; for any other INFO it returns without writing D or E after the ABS pass.
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../dlasq2/lib/base.js': function failingDlasq2() {
			return 1;
		}
	});
	const d = new Float64Array( [ -3.0, 5.0, -2.0 ] );
	const e = new Float64Array( [ -4.0, 1.5 ] );
	const info = mod.default( 3, d, 1, 0, e, 1, 0, new Float64Array( 12 ), 1, 0 );
	assert.strictEqual( info, 1 );
	assert.deepStrictEqual( Array.from( d ), [ 3.0, 5.0, 2.0 ] );
	assert.deepStrictEqual( Array.from( e ), [ -4.0, 1.5 ] );
});
