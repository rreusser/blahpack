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

/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsapps from './../lib/ndarray.js';


// FIXTURES //

// Reference outputs generated from the ARPACK Fortran (test/fortran/test_dsapps.f90);
// regenerate with `./test/run_fortran.sh arpack dsapps`.
const fixtureURL = new URL( '../../../../test/fixtures/dsapps.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});

// Leading dimension used by the Fortran driver for v, h, and q.
const LD = 8;

// Diagonal / subdiagonal / shift inputs, keyed by fixture name (see test_dsapps.f90).
const INPUTS = {
	'basic_n6_k3_p2': { diag: [ 2.0, 1.0, 3.0, 0.5, 2.5 ], sub: [ 1.0, 0.5, 1.5, 0.75 ], shift: [ 1.5, 4.0 ] },
	'deflate_n6_k3_p2': { diag: [ 2.0, 1.0, 3.0, 0.5, 2.5 ], sub: [ 1.0, 0.0, 1.5, 0.75 ], shift: [ 1.5, 4.0 ] },
	'wide_n7_k2_p3': { diag: [ 1.5, 2.0, 0.5, 3.0, 1.0 ], sub: [ 0.5, 1.25, 0.75, 2.0 ], shift: [ 0.5, 2.5, -1.0 ] },
	'single_n5_k2_p1': { diag: [ 3.0, 1.0, 2.0 ], sub: [ 1.0, 0.5 ], shift: [ 1.75 ] }
};

const TOL = 1e-12;


// FUNCTIONS //

function buildV( n, kplusp ) {
	const v = new Float64Array( LD * 8 );
	for ( let j = 1; j <= kplusp; j++ ) {
		for ( let i = 1; i <= n; i++ ) {
			v[ ( ( j - 1 ) * LD ) + ( i - 1 ) ] = ( 0.25 * i ) - ( 0.125 * j ) + 0.5;
		}
	}
	return v;
}

function buildH( diag, sub ) {
	const h = new Float64Array( LD * 2 );
	for ( let i = 0; i < diag.length; i++ ) {
		h[ LD + i ] = diag[ i ]; // column 1: diagonal
	}
	for ( let i = 0; i < sub.length; i++ ) {
		h[ i + 1 ] = sub[ i ]; // column 0, rows 1..: subdiagonal
	}
	return h;
}

function buildResid( n ) {
	const r = new Float64Array( 8 );
	for ( let i = 1; i <= n; i++ ) {
		r[ i - 1 ] = ( 0.5 * i ) - 1.25;
	}
	return r;
}

// Flatten a column-major sub-block in the same order as the Fortran print_matrix helper.
function flatten( arr, ld, m, ncol ) {
	const out = [];
	for ( let j = 1; j <= ncol; j++ ) {
		for ( let i = 1; i <= m; i++ ) {
			out.push( arr[ ( ( j - 1 ) * ld ) + ( i - 1 ) ] );
		}
	}
	return out;
}

function assertClose( actual, expected, msg ) {
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch' );
	for ( let i = 0; i < expected.length; i++ ) {
		const rel = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
		assert.ok( rel <= TOL, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}


// TESTS //

for ( const tc of cases ) {
	test( 'dsapps: ' + tc.name, function t() {
		const inp = INPUTS[ tc.name ];
		const n = tc.n;
		const kev = tc.kev;
		const np = tc.np;
		const kplusp = kev + np;
		const v = buildV( n, kplusp );
		const h = buildH( inp.diag, inp.sub );
		const resid = buildResid( n );
		const q = new Float64Array( LD * 8 );
		const shift = new Float64Array( inp.shift );
		const workd = new Float64Array( 16 );

		dsapps( n, kev, np, shift, 1, 0, v, 1, LD, 0, h, 1, LD, 0, resid, 1, 0, q, 1, LD, 0, workd, 1, 0 );

		assertClose( flatten( v, LD, n, kplusp ), tc.v, 'v' );
		assertClose( flatten( h, LD, kplusp, 2 ), tc.h, 'h' );
		assertClose( resid.subarray( 0, n ), tc.resid, 'resid' );
		assertClose( flatten( q, LD, kplusp, kplusp ), tc.q, 'q' );
	});
}

test( 'dsapps: throws RangeError for undersized workd', function t() {
	const v = buildV( 5, 3 );
	const h = buildH( [ 3.0, 1.0, 2.0 ], [ 1.0, 0.5 ] );
	const resid = buildResid( 5 );
	const q = new Float64Array( LD * 8 );
	assert.throws( function throws() {
		dsapps( 5, 2, 1, new Float64Array( [ 1.75 ] ), 1, 0, v, 1, LD, 0, h, 1, LD, 0, resid, 1, 0, q, 1, LD, 0, new Float64Array( 5 ), 1, 0 );
	}, RangeError );
});

test( 'dsapps: throws RangeError for a missing workd', function t() {
	const v = buildV( 5, 3 );
	const h = buildH( [ 3.0, 1.0, 2.0 ], [ 1.0, 0.5 ] );
	const resid = buildResid( 5 );
	const q = new Float64Array( LD * 8 );
	assert.throws( function throws() {
		dsapps( 5, 2, 1, new Float64Array( [ 1.75 ] ), 1, 0, v, 1, LD, 0, h, 1, LD, 0, resid, 1, 0, q, 1, LD, 0, null, 1, 0 );
	}, RangeError );
});

test( 'dsapps: throws RangeError for workd too short from its offset', function t() {
	const v = buildV( 5, 3 );
	const h = buildH( [ 3.0, 1.0, 2.0 ], [ 1.0, 0.5 ] );
	const resid = buildResid( 5 );
	const q = new Float64Array( LD * 8 );
	assert.throws( function throws() {
		dsapps( 5, 2, 1, new Float64Array( [ 1.75 ] ), 1, 0, v, 1, LD, 0, h, 1, LD, 0, resid, 1, 0, q, 1, LD, 0, new Float64Array( 12 ), 1, 3 );
	}, RangeError );
});

test( 'dsapps: throws RangeError for negative n, kev, or np', function t() {
	const v = buildV( 5, 3 );
	const h = buildH( [ 3.0, 1.0, 2.0 ], [ 1.0, 0.5 ] );
	const resid = buildResid( 5 );
	const q = new Float64Array( LD * 8 );
	const workd = new Float64Array( 16 );
	assert.throws( function throws() {
		dsapps( -1, 2, 1, new Float64Array( [ 1.75 ] ), 1, 0, v, 1, LD, 0, h, 1, LD, 0, resid, 1, 0, q, 1, LD, 0, workd, 1, 0 );
	}, RangeError );
	assert.throws( function throws() {
		dsapps( 5, -1, 1, new Float64Array( [ 1.75 ] ), 1, 0, v, 1, LD, 0, h, 1, LD, 0, resid, 1, 0, q, 1, LD, 0, workd, 1, 0 );
	}, RangeError );
	assert.throws( function throws() {
		dsapps( 5, 2, -1, new Float64Array( [ 1.75 ] ), 1, 0, v, 1, LD, 0, h, 1, LD, 0, resid, 1, 0, q, 1, LD, 0, workd, 1, 0 );
	}, RangeError );
});

test( 'dsapps: zeros an off-diagonal made negligible by the last shift (exact-shift deflation)', function t() {
	// H = [2 1; 1 1] with the exact eigenvalue 1.5+sqrt(1.25) as the shift: one implicit QR step drives h(2,1) to O(eps) rather than exactly zero, and the post-shift deflation scan (ARPACK label 90 -> loop 100, reached via `go to 90` when h(itop+1,1) > 0) must set it to exactly zero.
	const v = buildV( 3, 2 );
	const h = buildH( [ 2.0, 1.0 ], [ 1.0 ] );
	const resid = buildResid( 3 );
	const q = new Float64Array( LD * 8 );
	const workd = new Float64Array( 16 );
	const lam = 1.5 + Math.sqrt( 1.25 );

	dsapps( 3, 1, 1, new Float64Array( [ lam ] ), 1, 0, v, 1, LD, 0, h, 1, LD, 0, resid, 1, 0, q, 1, LD, 0, workd, 1, 0 );

	assert.strictEqual( h[ 1 ], 0.0, 'h(2,1) deflated to exactly zero' );
	assert.ok( Math.abs( h[ LD ] - ( 1.5 - Math.sqrt( 1.25 ) ) ) <= 1e-14, 'h(1,2) is the unshifted eigenvalue' );
	assert.ok( Math.abs( h[ LD + 1 ] - lam ) <= 1e-14, 'h(2,2) converged to the shift' );
});

test( 'dsapps: a trailing 1x1 block (h(kplusp,1) = 0) is left untouched and unused storage is never read', function t() {
	// With h(kplusp,1) = 0 the bulge chase splits off a trailing single-element block, for which istart = iend = kplusp; no rotation may be built there (it would read h(kplusp+1,1), outside the matrix). Poison that slot with NaN.
	const v = buildV( 4, 3 );
	const h = buildH( [ 2.0, 1.0, 3.0 ], [ 1.0, 0.0 ] );
	const resid = buildResid( 4 );
	const q = new Float64Array( LD * 8 );
	const workd = new Float64Array( 16 );
	let i;
	h[ 3 ] = NaN; // h(kplusp+1,1): outside the kplusp-by-2 matrix

	dsapps( 4, 2, 1, new Float64Array( [ 1.75 ] ), 1, 0, v, 1, LD, 0, h, 1, LD, 0, resid, 1, 0, q, 1, LD, 0, workd, 1, 0 );

	for ( i = 0; i < 3; i++ ) {
		assert.ok( Number.isFinite( h[ i ] ) && Number.isFinite( h[ LD + i ] ), 'h row ' + i + ' finite' );
		assert.ok( Number.isFinite( q[ ( 2 * LD ) + i ] ), 'q(' + i + ',kplusp) finite' );
	}
	for ( i = 0; i < 4; i++ ) {
		assert.ok( Number.isFinite( resid[ i ] ), 'resid finite' );
		assert.ok( Number.isFinite( v[ i ] ) && Number.isFinite( v[ LD + i ] ), 'v finite' );
	}
	assert.strictEqual( h[ 2 ], 0.0, 'h(3,1) stays zero' );
	assert.strictEqual( h[ LD + 2 ], 3.0, 'decoupled diagonal h(3,2) unchanged' );
	assert.deepStrictEqual( Array.from( q.subarray( 2 * LD, ( 2 * LD ) + 3 ) ), [ 0.0, 0.0, 1.0 ], 'Q(:,kplusp) = e_kplusp' );
	assert.ok( Number.isNaN( h[ 3 ] ), 'poisoned slot not written' );
});

test( 'dsapps: leading blocks deflated to exactly zero are skipped by later shifts (itop advance)', function t() {
	// H = diag( [2 .5; .5 1], 5 ). The exact shift lambda+ = 1.5+sqrt(0.5) makes the chase produce h(2,1) = 0 exactly, so after shift 1 the reference advances itop past rows 1 and 2 (`do 80`, `go to 90` on the first positive subdiagonal). Shift 2 must then start at itop = 3. The reference reads h(1,1) (outside the tridiagonal) only when a 1x1 block ends at iend = 1, which no longer happens; restarting the scan at row 1 would negate h(1,1) and Q(:,1).
	const lam = 1.5 + Math.sqrt( 0.5 );
	const v = new Float64Array( LD * 8 );
	const h = buildH( [ 2.0, 1.0, 5.0 ], [ 0.5, 0.0 ] );
	const resid = buildResid( 4 );
	const q = new Float64Array( LD * 8 );
	const workd = new Float64Array( 16 );
	let i;
	for ( i = 0; i < 3; i++ ) {
		v[ ( i * LD ) + i ] = 1.0; // V = I
	}
	h[ 0 ] = -1.0;

	dsapps( 4, 1, 2, new Float64Array( [ lam, 0.25 ] ), 1, 0, v, 1, LD, 0, h, 1, LD, 0, resid, 1, 0, q, 1, LD, 0, workd, 1, 0 );

	assert.strictEqual( h[ 0 ], -1.0, 'h(1,1) not referenced after itop advanced' );
	assert.strictEqual( h[ 1 ], 0.0, 'h(2,1) deflated' );
	assert.strictEqual( h[ 2 ], 0.0, 'h(3,1) stays zero' );
	assertClose( Array.from( h.subarray( LD, LD + 3 ) ), [ 1.5 - Math.sqrt( 0.5 ), lam, 5.0 ], 'diag' );

	// v(:,1) is the unit eigenvector of [2 .5; .5 1] for 1.5-sqrt(0.5): (sin(pi/8), -cos(pi/8)).
	assertClose( Array.from( v.subarray( 0, 4 ) ), [ Math.sin( Math.PI / 8.0 ), -Math.cos( Math.PI / 8.0 ), 0.0, 0.0 ], 'v(:,1)' );
});
