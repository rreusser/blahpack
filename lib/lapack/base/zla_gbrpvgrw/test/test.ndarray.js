/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zla_gbrpvgrw from './../lib/ndarray.js';


// FUNCTIONS //

function approxEqual( actual, expected, tol, msg ) {
	var abs = Math.abs( actual - expected );
	var ref = Math.max( Math.abs( expected ), 1.0 );
	assert.ok( abs <= tol * ref, msg + ' got=' + actual + ' expected=' + expected );
}


// TESTS //

test( 'zla_gbrpvgrw: main export is a function', function t() {
	assert.strictEqual( typeof zla_gbrpvgrw, 'function', 'is a function' );
});

test( 'zla_gbrpvgrw: throws RangeError for negative N', function t() {
	assert.throws( function f() {
		zla_gbrpvgrw( -1, 0, 0, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0 );
	}, RangeError );
});

test( 'zla_gbrpvgrw: ncols=0 returns 1', function t() {
	var AB = new Complex128Array( 4 );
	var AFB = new Complex128Array( 4 );
	var r = zla_gbrpvgrw( 2, 0, 0, 0, AB, 1, 1, 0, AFB, 1, 1, 0 );
	assert.strictEqual( r, 1.0 );
});

test( 'zla_gbrpvgrw: diagonal-only band (kl=0, ku=0) unit ratio', function t() {
	// 3x3 diagonal A = diag(1,2,3). Band storage: LDAB=1, 1 row of N entries.
	// AB[0,j] = A[j,j].
	var N = 3;
	var AB = new Complex128Array( [ 1, 0, 2, 0, 3, 0 ] );
	var AFB = new Complex128Array( [ 1, 0, 2, 0, 3, 0 ] );

	// strideAB1=1 (row stride), strideAB2=1 (col stride for LDAB=1)
	var r = zla_gbrpvgrw( N, 0, 0, N, AB, 1, 1, 0, AFB, 1, 1, 0 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'zla_gbrpvgrw: diagonal with growth', function t() {
	// A diag = (1, 1, 1); AFB diag = (5, 1, 1) -> col 0 ratio 1/5 = 0.2
	var N = 3;
	var AB = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
	var AFB = new Complex128Array( [ 5, 0, 1, 0, 1, 0 ] );
	var r = zla_gbrpvgrw( N, 0, 0, N, AB, 1, 1, 0, AFB, 1, 1, 0 );
	approxEqual( r, 0.2, 1e-12, 'rpvgrw' );
});

test( 'zla_gbrpvgrw: zero umax leaves rpvgrw unchanged', function t() {
	// AFB column 0 entirely zero -> umax=0 branch.
	var N = 1;
	var AB = new Complex128Array( [ 5, 0 ] );
	var AFB = new Complex128Array( [ 0, 0 ] );
	var r = zla_gbrpvgrw( N, 0, 0, N, AB, 1, 1, 0, AFB, 1, 1, 0 );
	assert.strictEqual( r, 1.0 );
});

test( 'zla_gbrpvgrw: tridiagonal (kl=1, ku=1) unit ratio', function t() {
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
	var N = 3;
	var LDAB = 3;
	var AB = new Complex128Array([
		0, 0, 2, 0, 1, 0,
		1, 0, 3, 0, 1, 0,
		1, 0, 4, 0, 0, 0
	]);

	// AFB has same layout but LDAFB = 2*kl+ku+1 = 4. Top kl rows are fill-in (unused

	// For U; the routine reads the top ku+1 = 2 rows of column j from AFB to get U[*,j]).

	// Wait — re-read: the routine does `cabs1( AFBv, oAF + ((kd+i-j)*sf1) + (j*sf2) )`

	// With kd=ku, same as AB. So AFB uses same indexing — but typically zgbtrf stores

	// L below row kl+ku, so for the U scan we just need rows 0..kd.

	// For our identity test, set AFB == AB but use LDAFB=4 (extra padding row at bottom).
	var LDAFB = 4;
	var AFB = new Complex128Array([
		0, 0, 2, 0, 1, 0, 0, 0,
		1, 0, 3, 0, 1, 0, 0, 0,
		1, 0, 4, 0, 0, 0, 0, 0
	]);
	var r = zla_gbrpvgrw( N, 1, 1, N, AB, 1, LDAB, 0, AFB, 1, LDAFB, 0 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'zla_gbrpvgrw: tridiagonal with U-factor growth', function t() {
	// Same A as above; AFB with U[0,0] = 10 (growth) -> col 0 ratio 2/10 = 0.2
	var N = 3;
	var LDAB = 3;
	var AB = new Complex128Array([
		0, 0, 2, 0, 1, 0,
		1, 0, 3, 0, 1, 0,
		1, 0, 4, 0, 0, 0
	]);
	var LDAFB = 4;
	var AFB = new Complex128Array([
		0, 0, 10, 0, 1, 0, 0, 0,
		1, 0, 3, 0, 1, 0, 0, 0,
		1, 0, 4, 0, 0, 0, 0, 0
	]);
	var r = zla_gbrpvgrw( N, 1, 1, N, AB, 1, LDAB, 0, AFB, 1, LDAFB, 0 );
	approxEqual( r, 0.2, 1e-12, 'rpvgrw' );
});

test( 'zla_gbrpvgrw: wider band (kl=2, ku=1)', function t() {
	// 4x4 with kl=2, ku=1. LDAB = kl+ku+1 = 4.
	// Kd = ku = 1, so for col j: row r = kd+i-j corresponds to A[i,j]; valid r in [0, kl+ku].
	// Test: identity-like A, AFB equal -> ratio 1.
	var N = 4;
	var LDAB = 4;

	// Use diagonal-only A (other band entries zero) — easiest.
	var AB = new Complex128Array( 2 * LDAB * N );
	var AFB = new Complex128Array( 2 * LDAB * N );
	var i;

	// Place diagonal entries A[j,j] at row kd=1, column j.
	for ( i = 0; i < N; i += 1 ) {
		AB[ 2 * ( 1 + ( i * LDAB ) ) ] = i + 1; // 1, 2, 3, 4
		AFB[ 2 * ( 1 + ( i * LDAB ) ) ] = i + 1;
	}
	var r = zla_gbrpvgrw( N, 2, 1, N, AB, 1, LDAB, 0, AFB, 1, LDAFB( LDAB ), 0 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );

	function LDAFB( v ) {
		return v;
	}
});

test( 'zla_gbrpvgrw: ncols < N processes subset', function t() {
	// 3x3 diagonal, only first 2 cols processed.
	var N = 3;
	var AB = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
	var AFB = new Complex128Array( [ 1, 0, 1, 0, 9, 0 ] ); // col 2 differs
	var r = zla_gbrpvgrw( N, 0, 0, 2, AB, 1, 1, 0, AFB, 1, 1, 0 );

	// Cols 0, 1 ratio 1; col 2 not consulted -> result 1
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'zla_gbrpvgrw: complex CABS1 contributions', function t() {
	// 1x1 with complex value: A=1+1i (CABS1=2), AFB=3+4i (CABS1=7) -> 2/7
	var AB = new Complex128Array( [ 1, 1 ] );
	var AFB = new Complex128Array( [ 3, 4 ] );
	var r = zla_gbrpvgrw( 1, 0, 0, 1, AB, 1, 1, 0, AFB, 1, 1, 0 );
	approxEqual( r, 2.0 / 7.0, 1e-12, 'rpvgrw' );
});

test( 'zla_gbrpvgrw: respects nonzero offsets', function t() {
	// 2x2 diagonal (kl=ku=0), with leading padding of 1 complex element.
	var AB = new Complex128Array( [ 99, 99, 3, 0, 4, 0 ] );
	var AFB = new Complex128Array( [ 99, 99, 6, 0, 4, 0 ] ); // col 0 grows by 2
	var r = zla_gbrpvgrw( 2, 0, 0, 2, AB, 1, 1, 1, AFB, 1, 1, 1 );
	approxEqual( r, 0.5, 1e-12, 'rpvgrw' );
});

test( 'zla_gbrpvgrw: range max(j-ku,0) clamps at 0 for early columns', function t() {
	// 4x4 with kl=1, ku=2. LDAB = kl+ku+1 = 4. Tests j-ku < 0 branch.
	var N = 4;
	var LDAB = 4;
	var AB = new Complex128Array( 2 * LDAB * N );
	var AFB = new Complex128Array( 2 * LDAB * N );
	var i;

	// Diagonal at row kd=2 in each col.
	for ( i = 0; i < N; i += 1 ) {
		AB[ 2 * ( 2 + ( i * LDAB ) ) ] = i + 1;
		AFB[ 2 * ( 2 + ( i * LDAB ) ) ] = i + 1;
	}
	var r = zla_gbrpvgrw( N, 1, 2, N, AB, 1, LDAB, 0, AFB, 1, LDAB, 0 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'zla_gbrpvgrw: range min(j+kl+1,N) clamps at N for last columns', function t() {
	// 3x3 tridiag (kl=1, ku=1) -- already covered, but explicitly verify: when j=N-1=2,
	// The inner loop runs i in [max(2-1,0), min(2+1+1, 3)) = [1, 3).
	var N = 3;
	var LDAB = 3;
	var LDAFB = 4;
	var AB = new Complex128Array([
		0, 0, 1, 0, 0, 0,
		0, 0, 1, 0, 0, 0,
		0, 0, 1, 0, 0, 0
	]);
	var AFB = new Complex128Array([
		0, 0, 1, 0, 0, 0, 0, 0,
		0, 0, 1, 0, 0, 0, 0, 0,
		0, 0, 1, 0, 0, 0, 0, 0
	]);
	var r = zla_gbrpvgrw( N, 1, 1, N, AB, 1, LDAB, 0, AFB, 1, LDAFB, 0 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});
