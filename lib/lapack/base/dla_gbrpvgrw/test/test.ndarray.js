/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dla_gbrpvgrw from './../lib/ndarray.js';


// FUNCTIONS //

function approxEqual( actual, expected, tol, msg ) {
	const abs = Math.abs( actual - expected );
	const ref = Math.max( Math.abs( expected ), 1.0 );
	assert.ok( abs <= tol * ref, msg + ' got=' + actual + ' expected=' + expected );
}


// TESTS //

test( 'dla_gbrpvgrw: main export is a function', function t() {
	assert.strictEqual( typeof dla_gbrpvgrw, 'function', 'is a function' );
});

test( 'dla_gbrpvgrw: throws RangeError for negative N', function t() {
	assert.throws( function f() {
		dla_gbrpvgrw( -1, 0, 0, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0 );
	}, RangeError );
});

test( 'dla_gbrpvgrw: ncols=0 returns 1', function t() {
	const AB = new Float64Array( 4 );
	const AFB = new Float64Array( 4 );
	const r = dla_gbrpvgrw( 2, 0, 0, 0, AB, 1, 1, 0, AFB, 1, 1, 0 );
	assert.strictEqual( r, 1.0 );
});

test( 'dla_gbrpvgrw: diagonal-only band (kl=0, ku=0) unit ratio', function t() {
	// 3x3 diagonal A = diag(1,2,3). Band storage: LDAB=1, 1 row of N entries.
	// AB[0,j] = A[j,j].
	const N = 3;
	const AB = new Float64Array( [ 1, 2, 3 ] );
	const AFB = new Float64Array( [ 1, 2, 3 ] );

	// strideAB1=1 (row stride), strideAB2=1 (col stride for LDAB=1)
	const r = dla_gbrpvgrw( N, 0, 0, N, AB, 1, 1, 0, AFB, 1, 1, 0 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'dla_gbrpvgrw: diagonal with growth', function t() {
	// A diag = (1, 1, 1); AFB diag = (5, 1, 1) -> col 0 ratio 1/5 = 0.2
	const N = 3;
	const AB = new Float64Array( [ 1, 1, 1 ] );
	const AFB = new Float64Array( [ 5, 1, 1 ] );
	const r = dla_gbrpvgrw( N, 0, 0, N, AB, 1, 1, 0, AFB, 1, 1, 0 );
	approxEqual( r, 0.2, 1e-12, 'rpvgrw' );
});

test( 'dla_gbrpvgrw: zero umax leaves rpvgrw unchanged', function t() {
	// AFB column 0 entirely zero -> umax=0 branch.
	const N = 1;
	const AB = new Float64Array( [ 5 ] );
	const AFB = new Float64Array( [ 0 ] );
	const r = dla_gbrpvgrw( N, 0, 0, N, AB, 1, 1, 0, AFB, 1, 1, 0 );
	assert.strictEqual( r, 1.0 );
});

test( 'dla_gbrpvgrw: tridiagonal (kl=1, ku=1) unit ratio', function t() {
	// 3x3 tridiag with kl=1, ku=1.
	// LDAB = kl+ku+1 = 3 for AB, LDAFB = 2*kl+ku+1 = 4 for AFB.
	// AB layout (col-major, LDAB=3): rows are [super, diag, sub] for each column.
	// AB[ku + i - j][j] = A[i][j], 0 <= ku+i-j < kl+ku+1
	// For kd=ku=1:
	//   Col 0: row 1 (diag) = A[0,0]; row 2 (sub) = A[1,0]; row 0 (super) unused (i=j-1=-1)
	//   Col 1: row 0 = A[0,1]; row 1 = A[1,1]; row 2 = A[2,1]
	//   Col 2: row 0 = A[1,2]; row 1 = A[2,2]; row 2 unused
	// A = [[2,1,0],[1,3,1],[0,1,4]]
	// AB col-major: [_, 2, 1,  1, 3, 1,  1, 4, _]
	const N = 3;
	const LDAB = 3;
	const AB = new Float64Array([
		0, 2, 1,
		1, 3, 1,
		1, 4, 0
	]);

	// AFB has same layout but LDAFB = 2*kl+ku+1 = 4. Top kl rows are fill-in.
	const LDAFB = 4;
	const AFB = new Float64Array([
		0, 2, 1, 0,
		1, 3, 1, 0,
		1, 4, 0, 0
	]);
	const r = dla_gbrpvgrw( N, 1, 1, N, AB, 1, LDAB, 0, AFB, 1, LDAFB, 0 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'dla_gbrpvgrw: tridiagonal with U-factor growth', function t() {
	// Same A as above; AFB with U[0,0] = 10 (growth) -> col 0 ratio 2/10 = 0.2
	const N = 3;
	const LDAB = 3;
	const AB = new Float64Array([
		0, 2, 1,
		1, 3, 1,
		1, 4, 0
	]);
	const LDAFB = 4;
	const AFB = new Float64Array([
		0, 10, 1, 0,
		1, 3, 1, 0,
		1, 4, 0, 0
	]);
	const r = dla_gbrpvgrw( N, 1, 1, N, AB, 1, LDAB, 0, AFB, 1, LDAFB, 0 );
	approxEqual( r, 0.2, 1e-12, 'rpvgrw' );
});

test( 'dla_gbrpvgrw: wider band (kl=2, ku=1)', function t() {
	// 4x4 with kl=2, ku=1. LDAB = kl+ku+1 = 4.
	// Kd = ku = 1, so for col j: row r = kd+i-j corresponds to A[i,j]; valid r in [0, kl+ku].
	// Test: identity-like A, AFB equal -> ratio 1.
	const N = 4;
	const LDAB = 4;
	const AB = new Float64Array( LDAB * N );
	const AFB = new Float64Array( LDAB * N );
	let i;

	// Place diagonal entries A[j,j] at row kd=1, column j.
	for ( i = 0; i < N; i += 1 ) {
		AB[ 1 + ( i * LDAB ) ] = i + 1; // 1, 2, 3, 4
		AFB[ 1 + ( i * LDAB ) ] = i + 1;
	}
	const r = dla_gbrpvgrw( N, 2, 1, N, AB, 1, LDAB, 0, AFB, 1, LDAB, 0 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'dla_gbrpvgrw: ncols < N processes subset', function t() {
	// 3x3 diagonal, only first 2 cols processed.
	const N = 3;
	const AB = new Float64Array( [ 1, 1, 1 ] );
	const AFB = new Float64Array( [ 1, 1, 9 ] ); // col 2 differs
	const r = dla_gbrpvgrw( N, 0, 0, 2, AB, 1, 1, 0, AFB, 1, 1, 0 );

	// Cols 0, 1 ratio 1; col 2 not consulted -> result 1
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'dla_gbrpvgrw: negative entries use absolute value', function t() {
	// 1x1 with negative AFB entry: A=2, AFB=-7 -> abs ratio 2/7
	const AB = new Float64Array( [ 2 ] );
	const AFB = new Float64Array( [ -7 ] );
	const r = dla_gbrpvgrw( 1, 0, 0, 1, AB, 1, 1, 0, AFB, 1, 1, 0 );
	approxEqual( r, 2.0 / 7.0, 1e-12, 'rpvgrw' );
});

test( 'dla_gbrpvgrw: respects nonzero offsets', function t() {
	// 2x2 diagonal (kl=ku=0), with leading padding of 1 element.
	const AB = new Float64Array( [ 99, 3, 4 ] );
	const AFB = new Float64Array( [ 99, 6, 4 ] ); // col 0 grows by 2
	const r = dla_gbrpvgrw( 2, 0, 0, 2, AB, 1, 1, 1, AFB, 1, 1, 1 );
	approxEqual( r, 0.5, 1e-12, 'rpvgrw' );
});

test( 'dla_gbrpvgrw: range max(j-ku,0) clamps at 0 for early columns', function t() {
	// 4x4 with kl=1, ku=2. LDAB = kl+ku+1 = 4. Tests j-ku < 0 branch.
	const N = 4;
	const LDAB = 4;
	const AB = new Float64Array( LDAB * N );
	const AFB = new Float64Array( LDAB * N );
	let i;

	// Diagonal at row kd=2 in each col.
	for ( i = 0; i < N; i += 1 ) {
		AB[ 2 + ( i * LDAB ) ] = i + 1;
		AFB[ 2 + ( i * LDAB ) ] = i + 1;
	}
	const r = dla_gbrpvgrw( N, 1, 2, N, AB, 1, LDAB, 0, AFB, 1, LDAB, 0 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'dla_gbrpvgrw: range min(j+kl+1,N) clamps at N for last columns', function t() {
	// 3x3 tridiag (kl=1, ku=1) -- already covered, but explicitly verify: when j=N-1=2,
	// The inner loop runs i in [max(2-1,0), min(2+1+1, 3)) = [1, 3).
	const N = 3;
	const LDAB = 3;
	const LDAFB = 4;
	const AB = new Float64Array([
		0, 1, 0,
		0, 1, 0,
		0, 1, 0
	]);
	const AFB = new Float64Array([
		0, 1, 0, 0,
		0, 1, 0, 0,
		0, 1, 0, 0
	]);
	const r = dla_gbrpvgrw( N, 1, 1, N, AB, 1, LDAB, 0, AFB, 1, LDAFB, 0 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});
