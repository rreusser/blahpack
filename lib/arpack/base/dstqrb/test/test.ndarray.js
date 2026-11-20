/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from ARPACK (arpack-ng 3.9.1), Copyright (c) 1996-2008 Rice
* University. Developed by D.C. Sorensen, R.B. Lehoucq, C. Yang, and
* K. Maschhoff, under the BSD-3-Clause license. See LICENSE.txt in the
* repository root for the full license text and upstream attribution.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dstqrb from './../lib/ndarray.js';


// FIXTURES //

// Reference outputs generated from the ARPACK Fortran (test/fortran/test_dstqrb.f90);
// regenerate with `./test/run_fortran.sh arpack dstqrb`.
const fixtureURL = new URL( './../../../../../test/fixtures/dstqrb.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});

// Original tridiagonal inputs, keyed by fixture name (see test_dstqrb.f90).
const INPUTS = {
	'tri2m1_n4': { d: [ 2.0, 2.0, 2.0, 2.0 ], e: [ -1.0, -1.0, -1.0 ] },
	'graded_n5': { d: [ 1.0, 2.0, 3.0, 4.0, 5.0 ], e: [ 1.0, 1.0, 1.0, 1.0 ] },
	'single_n1': { d: [ 3.0 ], e: [] },
	'split_n4': { d: [ 4.0, 1.0, 3.0, 2.0 ], e: [ 0.7, 0.0, -0.9 ] },
	'mixed_n6': { d: [ -2.0, 3.0, -1.0, 5.0, 0.5, -4.0 ], e: [ 1.5, -0.5, 2.0, 0.3, -1.2 ] }
};

const TOL = 1e-12;


// FUNCTIONS //

function assertArrayClose( actual, expected, tol, msg ) {
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch' );
	for ( let i = 0; i < expected.length; i++ ) {
		const rel = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
		assert.ok( rel <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}


// TESTS //

for ( const tc of cases ) {
	test( 'dstqrb: ' + tc.name, function t() {
		const inp = INPUTS[ tc.name ];
		const N = inp.d.length;
		const d = new Float64Array( inp.d );
		const e = new Float64Array( Math.max( N - 1, 1 ) );
		for ( let i = 0; i < N - 1; i++ ) {
			e[ i ] = inp.e[ i ];
		}
		const Z = new Float64Array( N );
		const WORK = new Float64Array( Math.max( ( 2 * N ) - 2, 1 ) );
		const info = dstqrb( N, d, 1, 0, e, 1, 0, Z, 1, 0, WORK, 1, 0 );
		assert.strictEqual( info, tc.info, 'info' );
		assertArrayClose( d, tc.d, TOL, 'eigenvalues' );
		assertArrayClose( Z, tc.z, TOL, 'last eigenvector row' );
	});
}

// Non-unit stride / offset for the larger case.
test( 'dstqrb (strided): mixed_n6', function t() {
	const tc = cases.find( ( c ) => c.name === 'mixed_n6' );
	const inp = INPUTS.mixed_n6;
	const N = inp.d.length;
	const d = new Float64Array( ( N * 2 ) + 1 );
	const e = new Float64Array( ( ( N - 1 ) * 2 ) + 1 );
	const Z = new Float64Array( ( N * 2 ) + 1 );
	for ( let i = 0; i < N; i++ ) {
		d[ ( i * 2 ) + 1 ] = inp.d[ i ];
	}
	for ( let i = 0; i < N - 1; i++ ) {
		e[ ( i * 2 ) + 1 ] = inp.e[ i ];
	}
	const WORK = new Float64Array( Math.max( ( 2 * N ) - 2, 1 ) );
	const info = dstqrb( N, d, 2, 1, e, 2, 1, Z, 2, 1, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	for ( let i = 0; i < N; i++ ) {
		const rd = Math.abs( d[ ( i * 2 ) + 1 ] - tc.d[ i ] ) / Math.max( Math.abs( tc.d[ i ] ), 1.0 );
		const rz = Math.abs( Z[ ( i * 2 ) + 1 ] - tc.z[ i ] ) / Math.max( Math.abs( tc.z[ i ] ), 1.0 );
		assert.ok( rd <= TOL, 'eigenvalue[' + i + ']' );
		assert.ok( rz <= TOL, 'z[' + i + ']' );
	}
});

test( 'dstqrb: blocks split by an exact zero are scaled independently', function t() {
	// Block 1 (|entries| ~ 1e200 > ssfmax) is scaled down by ~2e-47 while
	// block 2 (|entries| ~ 1e-300 < ssfmin) is scaled up. Treating both as one
	// block would scale block 2 by the block-1 factor and underflow it to 0.
	const d = new Float64Array( [ 2.0e200, 2.0e200, 2.0e-300, 2.0e-300 ] );
	const e = new Float64Array( [ 1.0e200, 0.0, 1.0e-300 ] );
	const Z = new Float64Array( 4 );
	const WORK = new Float64Array( 6 );
	const info = dstqrb( 4, d, 1, 0, e, 1, 0, Z, 1, 0, WORK, 1, 0 );
	const expected = [ 1.0e-300, 3.0e-300, 1.0e200, 3.0e200 ];
	const zabs = [ Math.SQRT1_2, Math.SQRT1_2, 0.0, 0.0 ];
	assert.strictEqual( info, 0, 'info' );
	for ( let i = 0; i < 4; i++ ) {
		assert.ok( Math.abs( ( d[ i ] / expected[ i ] ) - 1.0 ) <= 1e-14, 'd[' + i + ']: ' + d[ i ] );
		assert.ok( Math.abs( Math.abs( Z[ i ] ) - zabs[ i ] ) <= 1e-14, 'z[' + i + ']: ' + Z[ i ] );
	}
});

test( 'dstqrb: QR path (|d[N-1]| < |d[0]|) on a 3x3 with known spectrum', function t() {
	// T = [3 1 0; 1 2 1; 0 1 1] has det(T - lam*I) = -(lam-2)(lam^2-4lam+1),
	// so eigenvalues are 2-sqrt(3), 2, 2+sqrt(3). For eigenvalue lam the
	// eigenvector is x = (1, lam-3, (lam-3)/(lam-1)).
	const d = new Float64Array( [ 3.0, 2.0, 1.0 ] );
	const e = new Float64Array( [ 1.0, 1.0 ] );
	const Z = new Float64Array( 3 );
	const WORK = new Float64Array( 4 );
	const info = dstqrb( 3, d, 1, 0, e, 1, 0, Z, 1, 0, WORK, 1, 0 );
	const lams = [ 2.0 - Math.sqrt( 3.0 ), 2.0, 2.0 + Math.sqrt( 3.0 ) ];
	assert.strictEqual( info, 0, 'info' );
	for ( let i = 0; i < 3; i++ ) {
		const lam = lams[ i ];
		const x2 = lam - 3.0;
		const x3 = x2 / ( lam - 1.0 );
		const z3 = Math.abs( x3 ) / Math.sqrt( 1.0 + ( x2 * x2 ) + ( x3 * x3 ) );
		assert.ok( Math.abs( d[ i ] - lam ) <= 1e-14, 'd[' + i + ']: ' + d[ i ] );
		assert.ok( Math.abs( Math.abs( Z[ i ] ) - z3 ) <= 1e-14, 'z[' + i + ']: ' + Z[ i ] );
	}
});

test( 'dstqrb: NaN input exhausts NMAXIT and reports every unconverged off-diagonal in info', function t() {
	// A NaN never satisfies the deflation test, so the unreduced 4x4 block
	// iterates until JTOT = NMAXIT; INFO is then the count of nonzero E
	// entries, i.e. all N-1 = 3 of them (NaN != 0).
	const d = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const e = new Float64Array( [ 1.0, NaN, 1.0 ] );
	const Z = new Float64Array( 4 );
	const WORK = new Float64Array( 6 );
	const info = dstqrb( 4, d, 1, 0, e, 1, 0, Z, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 3, 'info' );
});

test( 'dstqrb: QR path undoes ssfmax/ssfmin scaling (homogeneity: eig(c*T) = c*eig(T))', function t() {
	// T = [3 1 0; 1 2 1; 0 1 1] (QR branch, since |d[N-1]| < |d[0]|) has
	// eigenvalues lam = 2-sqrt(3), 2, 2+sqrt(3) with eigenvector
	// x = (1, lam-3, (lam-3)/(lam-1)). Scaling T by c leaves the eigenvectors
	// unchanged and multiplies the eigenvalues by c. For c = 1e300 the block
	// is scaled down (anorm > ssfmax), for c = 1e-300 scaled up (anorm <
	// ssfmin); every exit of the QR loop reaches label 140, which must undo it.
	const lams = [ 2.0 - Math.sqrt( 3.0 ), 2.0, 2.0 + Math.sqrt( 3.0 ) ];
	for ( const c of [ 1.0e300, 1.0e-300 ] ) {
		const d = new Float64Array( [ 3.0 * c, 2.0 * c, 1.0 * c ] );
		const e = new Float64Array( [ c, c ] );
		const Z = new Float64Array( 3 );
		const WORK = new Float64Array( 4 );
		const info = dstqrb( 3, d, 1, 0, e, 1, 0, Z, 1, 0, WORK, 1, 0 );
		assert.strictEqual( info, 0, 'info' );
		for ( let i = 0; i < 3; i++ ) {
			const lam = lams[ i ];
			const x2 = lam - 3.0;
			const x3 = x2 / ( lam - 1.0 );
			const z3 = Math.abs( x3 ) / Math.sqrt( 1.0 + ( x2 * x2 ) + ( x3 * x3 ) );
			assert.ok( Math.abs( ( d[ i ] / c ) - lam ) <= 1e-14, 'c=' + c + ': d[' + i + ']/c: ' + ( d[ i ] / c ) );
			assert.ok( Math.abs( Math.abs( Z[ i ] ) - z3 ) <= 1e-14, 'c=' + c + ': z[' + i + ']: ' + Z[ i ] );
		}
	}
});

test( 'dstqrb: the QL and QR 1x1-deflation exits undo the block scaling (label 80/130 -> 140)', function t() {
	// c = 1e300 > ssfmax, so the block is scaled by ~4.5e-147. d = 0 next to
	// the tiny off-diagonal makes the split threshold 0, but the scaled
	// 1e-20 has E^2 <= SAFMIN, so the iteration deflates the 2x2 block first
	// (M = L+1) and then finishes with a converged 1x1 at L = LEND, whose
	// exit must still reach label 140 and undo the scaling.
	const c = 1.0e300;
	const r5 = Math.sqrt( 5.0 );
	const cases = [
		// QL (|d[2]| >= |d[0]|): rows 0-1 = c*[1 1; 1 0], row 2 = c
		[ [ c, 0.0, c ], [ c, 1.0e-20 ], [ ( 1.0 - r5 ) / 2.0, 1.0, ( 1.0 + r5 ) / 2.0 ] ],
		// QR (|d[2]| < |d[0]|): row 0 = 2c, rows 1-2 = c*[0 1; 1 1]
		[ [ 2.0 * c, 0.0, c ], [ 1.0e-20, c ], [ ( 1.0 - r5 ) / 2.0, ( 1.0 + r5 ) / 2.0, 2.0 ] ]
	];
	for ( let k = 0; k < cases.length; k++ ) {
		const d = new Float64Array( cases[ k ][ 0 ] );
		const e = new Float64Array( cases[ k ][ 1 ] );
		const Z = new Float64Array( 3 );
		const WORK = new Float64Array( 4 );
		const info = dstqrb( 3, d, 1, 0, e, 1, 0, Z, 1, 0, WORK, 1, 0 );
		assert.strictEqual( info, 0, 'info' );
		assertArrayClose( Array.from( d ).map( ( x ) => x / c ), cases[ k ][ 2 ], 1e-14, 'case ' + k + ': d/c' );
	}
});

test( 'dstqrb: the QL iteration-limit exit (JTOT = NMAXIT) undoes the block scaling', function t() {
	// anorm = Inf > ssfmax, so DLASCL scales the block by ssfmax/Inf = 0:
	// d = 0, e = [0, NaN, NaN]. Row 0 deflates (e[0] = 0); rows 1-3 never
	// converge and exhaust NMAXIT. Label 140 then rescales by Inf/ssfmax
	// (multiplier Inf), which turns the converged zeros d[0] and e[0] into
	// NaN, so every E entry is nonzero: INFO = 3. Skipping it leaves INFO = 2.
	const d = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const e = new Float64Array( [ 1.0, Infinity, Infinity ] );
	const Z = new Float64Array( 4 );
	const WORK = new Float64Array( 6 );
	const info = dstqrb( 4, d, 1, 0, e, 1, 0, Z, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 3, 'info' );
	assert.ok( Number.isNaN( d[ 0 ] ), 'd[0] rescaled by Inf' );
	assert.ok( Number.isNaN( e[ 0 ] ), 'e[0] rescaled by Inf' );
});

test( 'dstqrb: the QR iteration-limit exit (JTOT = NMAXIT) undoes the block scaling', function t() {
	// anorm = 1e160 > ssfmax, so the block is scaled by ~2.2e-7, and
	// |d[3]| < |d[0]| selects QR. d[1] = 0 makes the deflation threshold for
	// e[1] SAFMIN (scaled |e[1]| ~ 2.2e-147 is above it), while the first
	// rotation has s ~ e[0]/g ~ 1e-250, so s*e[1] underflows and every QR
	// sweep is the identity: the block stalls until JTOT = NMAXIT and INFO = 3.
	// Label 140 must still undo the scaling, returning T at its own scale.
	const origD = [ 1.0e110, 0.0, -1.0e70, 1.0e-120 ];
	const origE = [ 1.0e-90, -1.0e-140, -1.0e160 ];
	const d = new Float64Array( origD );
	const e = new Float64Array( origE );
	const Z = new Float64Array( 4 );
	const WORK = new Float64Array( 6 );
	const info = dstqrb( 4, d, 1, 0, e, 1, 0, Z, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 3, 'info' );
	assertArrayClose( Array.from( d ), origD, 1e-14, 'd' );
	assertArrayClose( Array.from( e ), origE, 1e-14, 'e' );
});
