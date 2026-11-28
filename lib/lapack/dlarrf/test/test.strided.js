/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import stridedFn from './../lib/strided.js';


// VARIABLES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', 'test', 'fixtures' );
const fixture = readFileSync( path.join( fixtureDir, 'dlarrf.jsonl' ), 'utf8' )
	.trim()
	.split( '\n' )
	.map( parseLine );
const PIVMIN = 2.2250738585072014e-308;
const SENTINEL = -9.9e99;
const TOL = 1e-13;


// FUNCTIONS //

/**
* Parses a JSONL line into an object.
*
* @private
* @param {string} line - JSONL line
* @returns {Object} parsed fixture record
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Looks up a fixture by name.
*
* @private
* @param {string} name - fixture name
* @returns {Object} fixture record
*/
function findCase( name ) {
	let i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	return null;
}

/**
* Asserts that `actual` is close to `expected` within relative tolerance.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - message prefix
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

/**
* Embeds `values` into a padded Float64Array at the given `offset` with the given `stride`; remaining slots are filled with `SENTINEL`.
*
* @private
* @param {Array<number>} values - values to embed
* @param {integer} stride - stride length
* @param {NonNegativeInteger} offset - starting index
* @param {NonNegativeInteger} totalLen - total length of the output array
* @returns {Float64Array} padded output array
*/
function padded( values, stride, offset, totalLen ) {
	const out = new Float64Array( totalLen );
	let i;
	for ( i = 0; i < totalLen; i++ ) {
		out[ i ] = SENTINEL;
	}
	for ( i = 0; i < values.length; i++ ) {
		out[ offset + ( i * stride ) ] = values[ i ];
	}
	return out;
}

/**
* Asserts that untouched sentinel slots in `arr` remain equal to `SENTINEL`.
*
* @private
* @param {Float64Array} arr - array to check
* @param {Array<NonNegativeInteger>} usedIdx - indices excluded from the sentinel check
* @param {string} msg - message prefix
*/
function assertSentinelsIntact( arr, usedIdx, msg ) {
	const used = {};
	let i;
	for ( i = 0; i < usedIdx.length; i++ ) {
		used[ usedIdx[ i ] ] = true;
	}
	for ( i = 0; i < arr.length; i++ ) {
		if ( !used[ i ] ) {
			assert.equal( arr[ i ], SENTINEL, msg + ': sentinel at index ' + i + ' was modified (got ' + arr[ i ] + ')' );
		}
	}
}


// TESTS //

test( 'strided is a function', function t() {
	assert.strictEqual( typeof stridedFn, 'function', 'is a function' );
});

test( 'strided: tridiag_3x3_wide with stride=2 and nonzero offsets, sentinel padding preserved', function t() {
	const sigma = new Float64Array( 1 );
	const dplus = new Float64Array( 12 );
	const lplus = new Float64Array( 12 );
	const work = new Float64Array( 12 );
	const wgap = padded( [ 3.9, 5.0, 0.0 ], 2, 1, 7 );
	const werr = padded( [ 1e-4, 1e-4, 1e-4 ], 2, 1, 7 );
	const tc = findCase( 'tridiag_3x3_wide' );
	const ld = padded( [ 2.0, 1.0, 0.0 ], 2, 1, 7 );
	const d = padded( [ 10.0, 5.0, 1.0 ], 2, 1, 7 );
	const l = padded( [ 0.2, 0.2, 0.0 ], 2, 1, 7 );
	const w = padded( [ 0.9, 4.9, 10.1 ], 2, 1, 7 );
	let i;
	for ( i = 0; i < dplus.length; i++ ) {
		dplus[ i ] = SENTINEL;
		lplus[ i ] = SENTINEL;
	}
	const info = stridedFn( 3, d, 2, 1, l, 2, 1, ld, 2, 1, 1, 3, w, 2, 1, wgap, 2, 1, werr, 2, 1, 10.0, 2.0, 2.0, PIVMIN, sigma, dplus, 3, 2, lplus, 3, 2, work, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( sigma[ 0 ], tc.sigma, TOL, 'sigma' );
	for ( i = 0; i < 3; i++ ) {
		assertClose( dplus[ 2 + ( i * 3 ) ], tc.dplus[ i ], TOL, 'dplus[' + i + ']' );
	}
	for ( i = 0; i < 2; i++ ) {
		assertClose( lplus[ 2 + ( i * 3 ) ], tc.lplus[ i ], TOL, 'lplus[' + i + ']' );
	}
	assertSentinelsIntact( dplus, [ 2, 5, 8 ], 'dplus' );
	assertSentinelsIntact( lplus, [ 2, 5 ], 'lplus' );
});

test( 'strided: tridiag_4x4_full_cluster with negative strides for inputs', function t() {
	const sigma = new Float64Array( 1 );
	const dplus = new Float64Array( 4 );
	const lplus = new Float64Array( 4 );
	const werr = new Float64Array( [ 1e-3, 1e-3, 1e-3, 1e-3 ] );
	const wgap = new Float64Array( [ 0.0, 1.0, 0.9, 0.9 ] );
	const work = new Float64Array( 8 );
	const tc = findCase( 'tridiag_4x4_full_cluster' );
	const ld = new Float64Array( [ 0.0, 0.2, 0.3, 0.4 ] );
	const d = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const l = new Float64Array( [ 0.0, 0.1, 0.1, 0.1 ] );
	const w = new Float64Array( [ 4.05, 2.95, 1.95, 0.95 ] );
	let i;
	const info = stridedFn( 4, d, -1, 3, l, -1, 3, ld, -1, 3, 1, 4, w, -1, 3, wgap, -1, 3, werr, 1, 0, 4.0, 1.0, 1.0, PIVMIN, sigma, dplus, 1, 0, lplus, 1, 0, work, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( sigma[ 0 ], tc.sigma, TOL, 'sigma' );
	for ( i = 0; i < 4; i++ ) {
		assertClose( dplus[ i ], tc.dplus[ i ], TOL, 'dplus[' + i + ']' );
	}
	for ( i = 0; i < 3; i++ ) {
		assertClose( lplus[ i ], tc.lplus[ i ], TOL, 'lplus[' + i + ']' );
	}
});

test( 'strided: N=0 quick return does not touch output arrays', function t() {
	const sigma = new Float64Array( 1 );
	const dplus = new Float64Array( [ SENTINEL, SENTINEL ] );
	const lplus = new Float64Array( [ SENTINEL, SENTINEL ] );
	const work = new Float64Array( 0 );
	const tc = findCase( 'n_zero' );
	const d = new Float64Array( 0 );
	const info = stridedFn( 0, d, 1, 0, d, 1, 0, d, 1, 0, 1, 1, d, 1, 0, d, 1, 0, d, 1, 0, 1.0, 1.0, 1.0, PIVMIN, sigma, dplus, 1, 0, lplus, 1, 0, work, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( dplus[ 0 ], SENTINEL, 'dplus[0] untouched' );
	assert.equal( dplus[ 1 ], SENTINEL, 'dplus[1] untouched' );
	assert.equal( lplus[ 0 ], SENTINEL, 'lplus[0] untouched' );
	assert.equal( lplus[ 1 ], SENTINEL, 'lplus[1] untouched' );
});


// FUNCTIONS (right-shift acceptance) //

/**
* Runs `dlarrf` on a two-eigenvalue cluster `[w0, w1]` starting at `c0` and asserts that the returned factorization satisfies `L+ D+ L+^T = L D L^T - sigma*I`.
*
* @private
* @param {Array} d - diagonal of `D`
* @param {Array} l - subdiagonal of `L`
* @param {integer} c0 - 1-based cluster start
* @param {number} w0 - first cluster eigenvalue
* @param {number} w1 - second cluster eigenvalue
* @param {number} spdiam - spectral diameter
* @param {number} pivmin - minimum pivot
* @returns {number} chosen shift
*/
function checkRightShift( d, l, c0, w0, w1, spdiam, pivmin ) {
	let lhs;
	let rhs;
	let i;

	const N = d.length;
	const ld = new Float64Array( N );
	const w = new Float64Array( N );
	const werr = new Float64Array( N );
	const wgap = new Float64Array( N );
	const sigma = new Float64Array( 1 );
	const dplus = new Float64Array( N );
	const lplus = new Float64Array( N );
	const work = new Float64Array( 2 * N );
	for ( i = 0; i < N; i++ ) {
		ld[ i ] = l[ i ] * d[ i ];
		wgap[ i ] = 1.0;
	}
	w[ c0 - 1 ] = w0;
	w[ c0 ] = w1;
	werr[ c0 - 1 ] = 1e-9;
	werr[ c0 ] = 1e-9;
	const info = stridedFn( N, new Float64Array( d ), 1, 0, new Float64Array( l ), 1, 0, ld, 1, 0, c0, c0 + 1, w, 1, 0, wgap, 1, 0, werr, 1, 0, spdiam, 1.0, 1.0, pivmin, sigma, dplus, 1, 0, lplus, 1, 0, work, 1, 0 );
	assert.equal( info, 0, 'info' );

	// The right shift RSIGMA = W(CLEND) + WERR(CLEND) (+ 4 eps relative) is chosen:
	assert.ok( Math.abs( sigma[ 0 ] - ( w1 + 1e-9 ) ) <= 1e-14, 'sigma is the right shift (got ' + sigma[ 0 ] + ')' );

	// Reconstruction: diagonal and off-diagonal of L+ D+ L+^T vs L D L^T - sigma*I.
	for ( i = 0; i < N; i++ ) {
		lhs = dplus[ i ];
		rhs = d[ i ] - sigma[ 0 ];
		if ( i > 0 ) {
			lhs += lplus[ i - 1 ] * lplus[ i - 1 ] * dplus[ i - 1 ];
			rhs += l[ i - 1 ] * l[ i - 1 ] * d[ i - 1 ];
		}
		assert.ok( Math.abs( lhs - rhs ) <= 1e-12 * ( 1.0 + Math.abs( rhs ) ), 'diag[' + i + ']: ' + lhs + ' vs ' + rhs );
		if ( i < N - 1 ) {
			assert.ok( Math.abs( ( lplus[ i ] * dplus[ i ] ) - ld[ i ] ) <= 1e-12 * ( 1.0 + Math.abs( ld[ i ] ) ), 'offdiag[' + i + ']' );
		}
	}
	return sigma[ 0 ];
}


// TESTS (right-shift acceptance) //

test( 'strided: right shift accepted by growth test returns the right-shift factorization in dplus/lplus', function t() {
	// Diagonal D = [1,2,3], cluster [1, 1.5]: the left shift (just below 1) makes |D+(1)| < pivmin (sawnan1), the right shift has growth 1.5 <= 8*spdiam, so RSIGMA is accepted (GOTO 100 from the second shift test) and WORK must be copied to DPLUS/LPLUS.
	checkRightShift( [ 1.0, 2.0, 3.0 ], [ 0.0, 0.0, 0.0 ], 1, 1.0, 1.5, 2.0, 0.01 );
});

test( 'strided: right shift accepted by the RRR2 heuristic returns the right-shift factorization in dplus/lplus', function t() {
	// Both shifts fail the growth test (8*spdiam = 8), the cluster is narrow (clwdth << mingap/128), MAX2 <= MAX1 so INDX = 2, and RRR2 <= MAXGROWTH2 accepts RSIGMA.
	checkRightShift( [ -1.0, -1.5, 6.5, 6.0 ], [ -0.75, -0.5, -1.0, 0.0 ], 1, -2.75, -2.749999, 1.0, 1e-12 );
});


// FUNCTIONS (general cases) //

/**
* Runs `dlarrf` on a case object and returns `info`, `sigma`, `dplus` and `lplus`.
*
* @private
* @param {Object} c - case (`d`, `l`, `ld`, `cs`, `ce`, `w`, `wgap`, `werr`, `spdiam`, `clgapl`, `clgapr`, `pivmin`)
* @returns {Object} results
*/
function run( c ) {
	const N = c.d.length;
	const sigma = new Float64Array( 1 );
	const dplus = new Float64Array( N );
	const lplus = new Float64Array( N );
	const info = stridedFn( N, new Float64Array( c.d ), 1, 0, new Float64Array( c.l ), 1, 0, new Float64Array( c.ld ), 1, 0, c.cs, c.ce, new Float64Array( c.w ), 1, 0, new Float64Array( c.wgap ), 1, 0, new Float64Array( c.werr ), 1, 0, c.spdiam, c.clgapl, c.clgapr, c.pivmin, sigma, dplus, 1, 0, lplus, 1, 0, new Float64Array( 2 * N ), 1, 0 );
	return {
		'info': info,
		'sigma': sigma[ 0 ],
		'dplus': dplus,
		'lplus': lplus
	};
}

/**
* Asserts `L+ D+ L+^T = L D L^T - sigma*I` entrywise, relative to the magnitudes of the terms.
*
* @private
* @param {Object} c - case
* @param {Object} r - results of `run`
* @param {number} tol - relative tolerance
*/
function assertShiftedFactorization( c, r, tol ) {
	const N = c.d.length;
	let lhs;
	let rhs;
	let sc;
	let i;
	for ( i = 0; i < N; i++ ) {
		lhs = r.dplus[ i ];
		rhs = c.d[ i ] - r.sigma;
		sc = Math.abs( r.dplus[ i ] ) + Math.abs( c.d[ i ] ) + Math.abs( r.sigma );
		if ( i > 0 ) {
			lhs += r.lplus[ i - 1 ] * r.lplus[ i - 1 ] * r.dplus[ i - 1 ];
			rhs += c.l[ i - 1 ] * c.ld[ i - 1 ];
			sc += Math.abs( r.lplus[ i - 1 ] * r.lplus[ i - 1 ] * r.dplus[ i - 1 ] ) + Math.abs( c.l[ i - 1 ] * c.ld[ i - 1 ] );
		}
		assert.ok( Math.abs( lhs - rhs ) <= tol * sc, 'diag[' + i + ']: ' + lhs + ' vs ' + rhs );
		if ( i < N - 1 ) {
			assert.ok( Math.abs( ( r.lplus[ i ] * r.dplus[ i ] ) - c.ld[ i ] ) <= tol * Math.abs( c.ld[ i ] ), 'offdiag[' + i + ']' );
		}
	}
}


// TESTS (general cases) //

test( 'strided: left shift accepted by the RRR1 heuristic (INDX = 1)', function t() {
	// L D L^T of two copies of a 4x4 block glued by 1e-5 (shifted so it is
	// Definite); cluster = eigenvalues 3:4 (a near-pair). Both shifts fail the
	// Growth test, MAX1 < MAX2 (INDX = 1), and RRR1 <= MAXGROWTH2 accepts LSIGMA.
	const c = {
		'd': [ 3.176203232309222, 2.9678102752363325, 1.1497207906795681, 1.4369540123594622, 3.1762032322396307, 2.9678102752208115, 1.1497207906768148, 1.4369540123582905 ],
		'l': [ 0.4722619713819264, 0.42118595330372327, 0.6523322932663467, 0.000006959164951688407, 0.47226197139227377, 0.42118595330592595, 0.6523322932679089 ],
		'ld': [ 1.5, 1.25, 0.75, 0.000009999999999999999, 1.5, 1.25, 0.75 ],
		'cs': 3,
		'ce': 4,
		'w': [ 0.5669676895565203, 0.5669697460235554, 1.916575511035834, 1.9165831520943781, 2.7391559393386884, 2.7391622533249507, 5.232105418852551, 5.232106148247302 ],
		'wgap': [ 0.000002056467035105314, 1.3496057650122786, 0.000007641058544116675, 0.8225727872443103, 0.000006313986262274085, 2.4929431655276, 7.293947517084121e-7, 0.0 ],
		'werr': [ 1e-12, 1e-13, 1e-11, 1e-13, 1e-11, 1e-14, 1e-11, 1e-11 ],
		'spdiam': 4.665138458690782,
		'clgapl': 1.3496057650122786,
		'clgapr': 0.8225727872443103,
		'pivmin': 8 * PIVMIN
	};
	const r = run( c );
	assert.equal( r.info, 0, 'info' );

	// LSIGMA = W(CLSTRT) - WERR(CLSTRT), less 4*eps relative:
	assert.ok( r.sigma < c.w[ 2 ] - c.werr[ 2 ], 'sigma lies left of the cluster: ' + r.sigma );
	assert.ok( r.sigma > c.w[ 2 ] - c.werr[ 2 ] - 1e-14, 'sigma is the (first) left shift: ' + r.sigma );
	assertShiftedFactorization( c, r, 1e-14 );
});

test( 'strided: a pivot of the left-shifted factorization below pivmin is replaced by -pivmin', function t() {
	// Three copies of a 3x3 block glued by 1e-13; the cluster 4:7 straddles
	// Two groups of tied eigenvalues, so a trial left shift lands on an
	// Eigenvalue of a leading submatrix and |D+(i)| < pivmin for some i > 1.
	const c = {
		'd': [ -1.9812968155398702, -3.0956769617387567, -4.242014006690242, -1.9812968155398702, -3.0956769617387567, -4.242014006690242, -1.9812968155398702, -3.0956769617387567, -4.242014006690242 ],
		'l': [ -0.757079902534076, -0.5653044621997875, -2.3573708111827586e-14, -0.757079902534076, -0.5653044621997875, -2.3573708111827586e-14, -0.757079902534076, -0.5653044621997875 ],
		'ld': [ 1.5, 1.75, 1e-13, 1.5, 1.75, 1e-13, 1.5, 1.75 ],
		'cs': 3,
		'ce': 6,
		'w': [ -6.737549584328789, -6.737549584328768, -6.737549584328746, -3.647674125118733, -3.6476741251186864, -3.64767412511864, -1.058666737172182, -1.0586667371721568, -1.0586667371721319 ],
		'wgap': [ 2.1316282072803006e-14, 2.220446049250313e-14, 3.089875459210013, 4.6629367034256575e-14, 4.618527782440651e-14, 2.589007387946458, 2.531308496145357e-14, 2.4868995751603507e-14, 0.0 ],
		'werr': [ 1e-11, 1e-10, 1e-15, 1e-15, 1e-15, 1e-15, 1e-12, 1e-14, 1e-11 ],
		'spdiam': 5.6788828471566575,
		'clgapl': 2.220446049250313e-14,
		'clgapr': 2.589007387946458,
		'pivmin': 9 * PIVMIN
	};
	const r = run( c );
	assert.equal( r.info, 0, 'info' );
	assertShiftedFactorization( c, r, 1e-14 );
});

test( 'strided: returns info = 1 when no shift gives an acceptable representation', function t() {
	// D = diag(1,2,3), cluster [1, 1.0001], pivmin = 0.01: every trial shift
	// (LSIGMA ~ 1 - 4eps, 1 - 5e-5; RSIGMA ~ 1.0001, 1.00015) leaves
	// |D(1) - sigma| < pivmin, so both factorizations see a tiny pivot
	// (SAWNAN1 and SAWNAN2, including the clamp of the first right-shift
	// Pivot); after KTRYMAX back-offs SMLGROWTH = 1/SAFMIN >= FAIL and NOFAIL
	// Is false, so INFO = 1.
	const c = {
		'd': [ 1.0, 2.0, 3.0 ],
		'l': [ 0.1, 0.1 ],
		'ld': [ 0.1, 0.2 ],
		'cs': 1,
		'ce': 2,
		'w': [ 1.0, 1.0001, 3.2 ],
		'wgap': [ 1e-4, 2.1, 0.0 ],
		'werr': [ 0.0, 0.0, 0.0 ],
		'spdiam': 2.5,
		'clgapl': 1.0,
		'clgapr': 2.1,
		'pivmin': 1e-2
	};
	const r = run( c );
	assert.equal( r.info, 1, 'info' );
});

test( 'dlarrf: growth above 1/SAFMIN is never recorded, so the forced shift is the initial left shift (ticket 0089)', function t() {
	// Reference: SMLGROWTH = ONE / DLAMCH('S') = 2^1022 ~ 4.49e307, and a trial shift is recorded as BESTSHIFT only if its growth MAX1/MAX2 .LE. SMLGROWTH.
	// D = [1e308, 1e308], L = 0, cluster W = [-1, 1], WERR = 0, SPDIAM = 1e-300: every trial factorization has growth 1e308 > 8*SPDIAM (rejected) and > 2^1022 (never recorded), with no NaN.
	// After KTRYMAX back-offs FAIL = (N-1)*MINGAP/(SPDIAM*EPS) overflows to +Inf, so SMLGROWTH < FAIL and the forced pass uses BESTSHIFT = its initial value LSIGMA = -1 - 4*EPS (EPS = DLAMCH('P') = 2^-52).
	// With SAFMIN = 0 (SMLGROWTH = +Inf) the last right shift 1.25 + 4*EPS would be recorded and chosen instead.
	const sigma = new Float64Array( 1 );
	const dplus = new Float64Array( 2 );
	const lplus = new Float64Array( 2 );
	const work = new Float64Array( 4 );
	const info = stridedFn( 2, new Float64Array( [ 1e308, 1e308 ] ), 1, 0, new Float64Array( [ 0.0, 0.0 ] ), 1, 0, new Float64Array( [ 0.0, 0.0 ] ), 1, 0, 1, 2, new Float64Array( [ -1.0, 1.0 ] ), 1, 0, new Float64Array( [ 2.0, 0.0 ] ), 1, 0, new Float64Array( [ 0.0, 0.0 ] ), 1, 0, 1e-300, 1.0, 1.0, PIVMIN, sigma, dplus, 1, 0, lplus, 1, 0, work, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( sigma[ 0 ], -( 1.0 + ( 4.0 * Math.pow( 2.0, -52 ) ) ), 'sigma' );
	assert.deepEqual( Array.from( dplus ), [ 1e308, 1e308 ], 'dplus' );
	assert.equal( lplus[ 0 ], 0.0, 'lplus' );
});

test( 'strided: WORK below the reference dimension 2*N throws; exactly 2*N, NaN-filled, from an offset, suffices (ticket 0016)', function t() {
	const tc = findCase( 'tridiag_3x3_wide' );
	function run( work, offsetWork ) {
		const sigma = new Float64Array( 1 );
		const dplus = new Float64Array( 3 );
		const lplus = new Float64Array( 3 );
		const info = stridedFn( 3, new Float64Array( [ 10.0, 5.0, 1.0 ] ), 1, 0, new Float64Array( [ 0.2, 0.2, 0.0 ] ), 1, 0, new Float64Array( [ 2.0, 1.0, 0.0 ] ), 1, 0, 1, 3, new Float64Array( [ 0.9, 4.9, 10.1 ] ), 1, 0, new Float64Array( [ 3.9, 5.0, 0.0 ] ), 1, 0, new Float64Array( [ 1e-4, 1e-4, 1e-4 ] ), 1, 0, 10.0, 2.0, 2.0, PIVMIN, sigma, dplus, 1, 0, lplus, 1, 0, work, 1, offsetWork );
		return [ info, sigma[ 0 ], dplus, lplus ];
	}
	assert.throws( function bad() {
		run( new Float64Array( 5 ), 0 );
	}, RangeError );
	assert.throws( function bad() {
		run( new Float64Array( 7 ), 2 );
	}, RangeError );
	const out = run( new Float64Array( 8 ).fill( NaN ), 2 );
	let i;
	assert.equal( out[ 0 ], tc.info, 'info' );
	assertClose( out[ 1 ], tc.sigma, TOL, 'sigma' );
	for ( i = 0; i < 3; i++ ) {
		assertClose( out[ 2 ][ i ], tc.dplus[ i ], TOL, 'dplus[' + i + ']' );
	}
});


// REFERENCE CASES FOUND BY MUTATION (ticket 0110) //

test( 'strided: reference cases that separate base.js mutants (info, sigma, dplus, lplus bit for bit; LPLUS(N) untouched)', function t() {
	const cases = fixture.filter( function isGiven( c ) {
		return c.name.indexOf( 'given_' ) === 0;
	});
	let sigma;
	let dplus;
	let lplus;
	let info;
	let tc;
	let k;
	assert.ok( cases.length > 40, 'fixture cases present' );
	for ( k = 0; k < cases.length; k++ ) {
		tc = cases[ k ];
		sigma = new Float64Array( 1 );
		dplus = new Float64Array( tc.N ).fill( 0.125 );
		lplus = new Float64Array( tc.N ).fill( 0.125 );
		info = stridedFn( tc.N, new Float64Array( tc.d ), 1, 0, new Float64Array( tc.l ), 1, 0, new Float64Array( tc.ld ), 1, 0, tc.clstrt, tc.clend, new Float64Array( tc.w ), 1, 0, new Float64Array( tc.wgap ), 1, 0, new Float64Array( tc.werr ), 1, 0, tc.spdiam, tc.clgapl, tc.clgapr, tc.pivmin, sigma, dplus, 1, 0, lplus, 1, 0, new Float64Array( 2 * tc.N ).fill( NaN ), 1, 0 );
		assert.equal( info, tc.info, tc.name + ': info' );
		assert.ok( Object.is( sigma[ 0 ], tc.sigma ), tc.name + ': sigma expected ' + tc.sigma + ', got ' + sigma[ 0 ] );
		assert.deepStrictEqual( Array.from( dplus ), tc.dplus, tc.name + ': dplus' );
		assert.deepStrictEqual( Array.from( lplus ), tc.lplus, tc.name + ': lplus' );
	}
});
