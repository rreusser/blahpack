/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { importWithConstants } from './../../../../../test/harness/constants.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsterf from './../lib/ndarray.js';

// FIXTURES //

import n_one from './fixtures/n_one.json' with { type: 'json' };
import two_by_two from './fixtures/two_by_two.json' with { type: 'json' };
import four_by_four from './fixtures/four_by_four.json' with { type: 'json' };
import already_diagonal from './fixtures/already_diagonal.json' with { type: 'json' };
import six_by_six_mixed from './fixtures/six_by_six_mixed.json' with { type: 'json' };
import split_matrix from './fixtures/split_matrix.json' with { type: 'json' };
import identity_tridiag from './fixtures/identity_tridiag.json' with { type: 'json' };
import toeplitz from './fixtures/toeplitz.json' with { type: 'json' };
import eight_by_eight from './fixtures/eight_by_eight.json' with { type: 'json' };
import qr_path from './fixtures/qr_path.json' with { type: 'json' };
import large_values from './fixtures/large_values.json' with { type: 'json' };
import small_values from './fixtures/small_values.json' with { type: 'json' };
import qr_four_by_four from './fixtures/qr_four_by_four.json' with { type: 'json' };

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
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// TESTS //

test( 'dsterf: n_zero', function t() {

	const d = new Float64Array( 0 );
	const e = new Float64Array( 0 );
	const info = dsterf( 0, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dsterf: n_one', function t() {

	const tc = n_one;
	const d = new Float64Array( [ 5.0 ] );
	const e = new Float64Array( 0 );
	const info = dsterf( 1, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: two_by_two', function t() {

	const tc = two_by_two;
	const d = new Float64Array( [ 2.0, 3.0 ] );
	const e = new Float64Array( [ 1.0 ] );
	const info = dsterf( 2, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: four_by_four', function t() {

	const tc = four_by_four;
	const d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0 ] );
	const e = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	const info = dsterf( 4, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: already_diagonal', function t() {

	const tc = already_diagonal;
	const d = new Float64Array( [ 3.0, 1.0, 4.0, 2.0 ] );
	const e = new Float64Array( [ 0.0, 0.0, 0.0 ] );
	const info = dsterf( 4, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: six_by_six_mixed', function t() {

	const tc = six_by_six_mixed;
	const d = new Float64Array( [ -2.0, 1.0, -3.0, 4.0, -1.0, 2.0 ] );
	const e = new Float64Array( [ 1.0, 2.0, 1.0, 3.0, 1.0 ] );
	const info = dsterf( 6, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: split_matrix', function t() {

	const tc = split_matrix;
	const d = new Float64Array( [ 2.0, 3.0, 5.0, 7.0 ] );
	const e = new Float64Array( [ 1.0, 0.0, 2.0 ] );
	const info = dsterf( 4, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: identity_tridiag', function t() {

	const tc = identity_tridiag;
	const d = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	const e = new Float64Array( [ 0.0, 0.0 ] );
	const info = dsterf( 3, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: toeplitz', function t() {

	const tc = toeplitz;
	const d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0, 2.0 ] );
	const e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const info = dsterf( 5, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: eight_by_eight', function t() {

	const tc = eight_by_eight;
	const d = new Float64Array( [ 10.0, 1.0, 8.0, 3.0, 6.0, 5.0, 4.0, 7.0 ] );
	const e = new Float64Array( [ 2.0, 3.0, 1.0, 4.0, 2.0, 1.0, 3.0 ] );
	const info = dsterf( 8, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: qr_path', function t() {

	const tc = qr_path;
	const d = new Float64Array( [ 0.1, 0.5, 10.0 ] );
	const e = new Float64Array( [ 1.0, 1.0 ] );
	const info = dsterf( 3, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: large_values', function t() {

	const tc = large_values;
	const d = new Float64Array( [ 1.0e154, 2.0e154, 3.0e154 ] );
	const e = new Float64Array( [ 0.5e154, 0.5e154 ] );
	const info = dsterf( 3, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: small_values', function t() {

	const tc = small_values;
	const d = new Float64Array( [ 1.0e-155, 2.0e-155, 3.0e-155 ] );
	const e = new Float64Array( [ 0.5e-155, 0.5e-155 ] );
	const info = dsterf( 3, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: qr_four_by_four', function t() {

	const tc = qr_four_by_four;
	const d = new Float64Array( [ 1.0, 2.0, 3.0, 100.0 ] );
	const e = new Float64Array( [ 5.0, 5.0, 5.0 ] );
	const info = dsterf( 4, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: strided input', function t() {

	const tc = two_by_two;
	const d = new Float64Array( [ 0.0, 2.0, 0.0, 3.0 ] );
	const e = new Float64Array( [ 0.0, 1.0 ] );
	const info = dsterf( 2, d, 2, 1, e, 1, 1 );
	assert.equal( info, 0, 'info' );
	assertClose( d[ 1 ], tc.d[ 0 ], 1e-14, 'd[0]' );
	assertClose( d[ 3 ], tc.d[ 1 ], 1e-14, 'd[1]' );
});

test( 'dsterf: QR deflation at m = lend+1 keeps the decoupled eigenvalue (scaled block, underflowing e^2)', function t() { // eslint-disable-line max-len
	// anorm = 1e300 > ssfmax, so the block is scaled by ~4.5e-147. The scaled
	// e[0] squared underflows to zero, so QR iteration (|d[2]| < |d[0]|) finds
	// a negligible E(LEND) at M = LEND+1 (Fortran GO TO 120 keeps M = LEND+1).
	// d[0] then decouples and is returned unchanged; the small eigenvalue of
	// the matrix is 1e-20 to full relative precision, the others are +/-1e300.
	const d = new Float64Array( [ 1.0e-20, 1.0e-20, 0.5e-20 ] );
	const e = new Float64Array( [ 1.0e-20, 1.0e300 ] );
	const info = dsterf( 3, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertClose( d[ 0 ], -1.0e300, 1e-14, 'd[0]' );
	assertClose( d[ 1 ] / 1.0e-20, 1.0, 1e-14, 'd[1]' );
	assertClose( d[ 2 ], 1.0e300, 1e-14, 'd[2]' );
});

test( 'dsterf: non-convergence counts only unconverged off-diagonals and leaves memory before E untouched', function t() { // eslint-disable-line max-len
	let lam;
	let p;
	let i;

	// Block 1 (rows 0-2) takes the QR path (|d[2]| < |d[0]|) and converges;
	// every deflation zeroes its off-diagonal (IF( M.GT.LEND ) E( M-1 ) = 0).
	// Block 2 (rows 3-5) contains a NaN, never deflates, and exhausts NMAXIT,
	// so INFO = number of nonzero E entries = 2 (both from block 2). The
	// element before E (offsetE = 1) must not be written when M = LEND = 0.
	const d = new Float64Array( [ 10.0, 0.5, 0.1, 1.0, 2.0, 3.0 ] );
	const e = new Float64Array( [ -7.0, 1.0, 1.0, 0.0, NaN, 1.0 ] );
	const info = dsterf( 6, d, 1, 0, e, 1, 1 );
	assert.equal( info, 2, 'info' );
	assert.equal( e[ 0 ], -7.0, 'sentinel before E untouched' );
	assert.equal( e[ 1 ], 0.0, 'e[0] deflated' );
	assert.equal( e[ 2 ], 0.0, 'e[1] deflated' );
	assert.equal( e[ 3 ], 0.0, 'e[2] split' );

	// Block 1 eigenvalues (unsorted on failure): roots of det(T1 - lam*I)
	assertClose( d[ 0 ] + d[ 1 ] + d[ 2 ], 10.6, 1e-14, 'trace' );
	for ( i = 0; i < 3; i++ ) {
		lam = d[ i ];
		p = ( ( 10.0 - lam ) * ( ( ( 0.5 - lam ) * ( 0.1 - lam ) ) - 1.0 ) ) - ( 0.1 - lam ); // eslint-disable-line max-len
		assert.ok( Math.abs( p ) <= 1e-12, 'char poly at d[' + i + ']: ' + p );
	}
});

test( 'dsterf: QL deflation zeroes each split off-diagonal and never writes past the end of E', function t() { // eslint-disable-line max-len
	let lam;
	let p;
	let i;

	// |d[2]| >= |d[0]|, so the block takes the QL path. Each deflation zeroes
	// its off-diagonal (IF( M.LT.LEND ) E( M ) = 0). M = LEND = N-1 must not
	// write E( LEND ), the slot one past the end of E, which holds a sentinel.
	const d = new Float64Array( [ 0.1, 0.5, 10.0 ] );
	const e = new Float64Array( [ 1.0, 1.0, -7.0 ] );
	const info = dsterf( 3, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( e[ 0 ], 0.0, 'e[0] deflated' );
	assert.equal( e[ 1 ], 0.0, 'e[1] deflated' );
	assert.equal( e[ 2 ], -7.0, 'sentinel past E untouched' );

	// Eigenvalues: ascending roots of det(T - lam*I)
	assertClose( d[ 0 ] + d[ 1 ] + d[ 2 ], 10.6, 1e-14, 'trace' );
	for ( i = 0; i < 3; i++ ) {
		lam = d[ i ];
		p = ( ( 0.1 - lam ) * ( ( ( 0.5 - lam ) * ( 10.0 - lam ) ) - 1.0 ) ) - ( 10.0 - lam ); // eslint-disable-line max-len
		assert.ok( Math.abs( p ) <= 1e-11, 'char poly at d[' + i + ']: ' + p );
		if ( i > 0 ) {
			assert.ok( d[ i ] >= d[ i - 1 ], 'ascending' );
		}
	}
});

test( 'dsterf: the QL 1x1-deflation exit undoes the block scaling (label 90 -> 150)', function t() { // eslint-disable-line max-len
	// c = 1e300 > ssfmax, so the block is scaled by ~4.5e-147. d[1] = 0 makes
	// the split threshold for e[1] zero, but the scaled e[1]^2 underflows to
	// zero, so QL (|d[2]| >= |d[0]|) deflates the 2x2 block rows 0-1 first
	// (M = L+1) and then finishes with a converged 1x1 at L = LEND, whose exit
	// must still reach label 150 and undo the scaling. Rows 0-1 are
	// c*[1 1; 1 0] and row 2 is c.
	const c = 1.0e300;
	const r5 = Math.sqrt( 5.0 );
	const d = new Float64Array( [ c, 0.0, c ] );
	const e = new Float64Array( [ c, 1.0e-20 ] );
	const info = dsterf( 3, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( Array.from( d ).map( ( x ) => x / c ), [ ( 1.0 - r5 ) / 2.0, 1.0, ( 1.0 + r5 ) / 2.0 ], 1e-14, 'd/c' ); // eslint-disable-line max-len
});

test( 'dsterf: the QR 2x2 (DLAE2) exit undoes the block scaling (label 140 -> 150)', function t() { // eslint-disable-line max-len
	let mu;
	let p;
	let i;

	// T = c*[-3 1 0; 1 -4 2; 0 2 -2] with c = 1e300 > ssfmax takes the QR
	// branch (|d[2]| < |d[0]|), deflates a 1x1 and finishes with DLAE2 on
	// the last 2x2 block; that exit must reach label 150 and undo the scaling.
	const c = 1.0e300;
	const d = new Float64Array( [ -3.0 * c, -4.0 * c, -2.0 * c ] );
	const e = new Float64Array( [ c, 2.0 * c ] );
	const info = dsterf( 3, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertClose( ( d[ 0 ] + d[ 1 ] + d[ 2 ] ) / c, -9.0, 1e-14, 'trace/c' );
	for ( i = 0; i < 3; i++ ) {
		mu = d[ i ] / c;
		p = ( ( -3.0 - mu ) * ( ( ( -4.0 - mu ) * ( -2.0 - mu ) ) - 4.0 ) ) - ( -2.0 - mu ); // eslint-disable-line max-len
		assert.ok( Math.abs( p ) <= 1e-12, 'char poly at d[' + i + ']/c: ' + p );
	}
});

test( 'dsterf: the QL iteration-limit exit (JTOT = NMAXIT) undoes the block scaling', function t() { // eslint-disable-line max-len
	// anorm = Inf > ssfmax, so DLASCL scales the block by ssfmax/Inf = 0:
	// d = 0, e = [0, NaN, NaN]. Row 0 deflates (d[0] = 0 has converged);
	// rows 1-3 never converge and exhaust NMAXIT. Label 150 then rescales D by
	// Inf/ssfmax (multiplier Inf), turning the converged zero d[0] into NaN;
	// skipping it would return d[0] = 0. E is not rescaled, so INFO = 2.
	const d = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const e = new Float64Array( [ 1.0, Infinity, Infinity ] );
	const info = dsterf( 4, d, 1, 0, e, 1, 0 );
	assert.equal( info, 2, 'info' );
	assert.equal( e[ 0 ], 0.0, 'e[0] deflated' );
	assert.ok( Number.isNaN( d[ 0 ] ), 'd[0] rescaled by Inf' );
});

// The QR iteration-limit exit cannot be reached by any known input, so the
// limit is set to 0 (test/harness/constants.js; ticket 0051). A scaled block
// (anorm > ssfmax) takes the QR branch (|d[2]| < |d[0]|) and hits the limit
// at once. The reference then goes to label 150, which undoes the scaling: D
// comes back at the input's scale, and INFO counts the nonzero E.
test( 'dsterf: the QR iteration-limit exit still undoes the block scaling (MAXIT = 0)', async function t() {
	const mod = await importWithConstants( new URL( './../lib/base.js', import.meta.url ), { 'MAXIT': 0 } );
	const c = 1.0e300;
	const d = new Float64Array( [ 3.0 * c, 2.0 * c, c ] );
	const e = new Float64Array( [ c, c ] );
	const info = mod.default( 3, d, 1, 0, e, 1, 0 );
	let i;
	assert.equal( info, 2, 'info counts the two unconverged off-diagonals' );
	for ( i = 0; i < 3; i++ ) {
		assertClose( d[ i ], [ 3.0 * c, 2.0 * c, c ][ i ], 1e-15, 'd[' + i + '] unscaled' );
	}
});
