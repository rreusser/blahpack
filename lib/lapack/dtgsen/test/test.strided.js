/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

/* eslint-disable no-restricted-syntax */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import dtgsen from './../lib/strided.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', 'test', 'fixtures' );
const rawLines = readFileSync( path.join( fixtureDir, 'dtgsen.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line max-len
const FIXTURES = rawLines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, format( '%s: expected %s, got %s', msg, expected, actual ) );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, format( '%s[%d]', msg, i ) );
	}
}

function findCase( name ) {
	let i;
	for ( i = 0; i < FIXTURES.length; i++ ) {
		if ( FIXTURES[ i ].name === name ) {
			return FIXTURES[ i ];
		}
	}
	throw new Error( format( 'fixture not found: %s', name ) );
}

function buildMat( N, ld, triplets ) {
	const a = new Float64Array( ld * N );
	let i, t;
	for ( i = 0; i < triplets.length; i++ ) {
		t = triplets[ i ];
		a[ ( t[ 1 ] - 1 ) * ld + ( t[ 0 ] - 1 ) ] = t[ 2 ];
	}
	return a;
}

function identity( N ) {
	const a = new Float64Array( N * N );
	let i;
	for ( i = 0; i < N; i++ ) {
		a[ ( i * N ) + i ] = 1.0;
	}
	return a;
}

function makeSel( N, idxs ) {
	const s = new Uint8Array( N );
	let i;
	for ( i = 0; i < idxs.length; i++ ) {
		s[ idxs[ i ] - 1 ] = 1;
	}
	return s;
}

function runCase( name, ijob, N, A, B, Q, Z, SELECT ) {
	const ld = Math.max( N, 1 );
	const ALPHAR = new Float64Array( Math.max( N, 1 ) );
	const ALPHAI = new Float64Array( Math.max( N, 1 ) );
	const BETA = new Float64Array( Math.max( N, 1 ) );
	const M = new Int32Array( 1 );
	const pl = [ 0 ];
	const pr = [ 0 ];
	const DIF = new Float64Array( 2 );
	const WORK = new Float64Array( 500 );
	const IWORK = new Int32Array( 500 );

	const info = dtgsen( ijob, true, true, SELECT, 1, 0, N,
		A, 1, ld, 0,
		B, 1, ld, 0,
		ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0,
		Q, 1, ld, 0,
		Z, 1, ld, 0,
		M, pl, pr, DIF, 1, 0,
		WORK, 1, 0, IWORK, 1, 0 );

	const tc = findCase( name );
	assert.equal( info, tc.info, name + ':info' );
	assert.equal( M[ 0 ], tc.M, name + ':M' );
	if ( tc.PL !== undefined ) {
		assertClose( pl[ 0 ], tc.PL, 1e-9, name + ':PL' );
	}
	if ( tc.PR !== undefined ) {
		assertClose( pr[ 0 ], tc.PR, 1e-9, name + ':PR' );
	}
	if ( tc.DIF ) {
		assertArrayClose( DIF, tc.DIF, 1e-9, name + ':DIF' );
	}
	if ( tc.ALPHAR ) {
		assertArrayClose( ALPHAR.slice( 0, tc.ALPHAR.length ), tc.ALPHAR, 1e-9, name + ':ALPHAR' );
	}
	if ( tc.ALPHAI ) {
		assertArrayClose( ALPHAI.slice( 0, tc.ALPHAI.length ), tc.ALPHAI, 1e-9, name + ':ALPHAI' );
	}
	if ( tc.BETA ) {
		assertArrayClose( BETA.slice( 0, tc.BETA.length ), tc.BETA, 1e-9, name + ':BETA' );
	}
}

function mkA4() {
	return buildMat( 4, 4, [
		[ 1, 1, 1 ], [ 1, 2, 0.5 ], [ 1, 3, 0.3 ], [ 1, 4, 0.2 ],
		[ 2, 2, 2 ], [ 2, 3, 0.4 ], [ 2, 4, 0.1 ],
		[ 3, 3, 3 ], [ 3, 4, 0.6 ],
		[ 4, 4, 4 ]
	]);
}

function mkB4() {
	return buildMat( 4, 4, [
		[ 1, 1, 1 ], [ 1, 2, 0.2 ], [ 1, 3, 0.1 ], [ 1, 4, 0.05 ],
		[ 2, 2, 1.5 ], [ 2, 3, 0.3 ], [ 2, 4, 0.15 ],
		[ 3, 3, 2 ], [ 3, 4, 0.4 ],
		[ 4, 4, 2.5 ]
	]);
}


// TESTS //

test( 'dtgsen: main export is a function', function t() {
	assert.strictEqual( typeof dtgsen, 'function', 'is a function' );
});

test( 'dtgsen: ijob0_select13', function t() {
	runCase( 'ijob0_select13', 0, 4, mkA4(), mkB4(), identity( 4 ), identity( 4 ), makeSel( 4, [ 1, 3 ] ) );
});

test( 'dtgsen: ijob0_complex_pair (2x2 block)', function t() {
	const A = buildMat( 4, 4, [
		[ 1, 1, 1 ], [ 1, 2, 0.5 ], [ 1, 3, 0.3 ], [ 1, 4, 0.2 ],
		[ 2, 2, 2 ], [ 2, 3, 0.4 ], [ 2, 4, 0.1 ],
		[ 3, 3, 4 ], [ 3, 4, 1.5 ],
		[ 4, 3, -1.5 ], [ 4, 4, 4 ]
	]);
	runCase( 'ijob0_complex_pair', 0, 4, A, mkB4(), identity( 4 ), identity( 4 ), makeSel( 4, [ 3, 4 ] ) );
});

test( 'dtgsen: ijob1_pl_pr', function t() {
	runCase( 'ijob1_pl_pr', 1, 4, mkA4(), mkB4(), identity( 4 ), identity( 4 ), makeSel( 4, [ 1, 2 ] ) );
});

test( 'dtgsen: ijob4_dif_frobenius', function t() {
	runCase( 'ijob4_dif_frobenius', 4, 4, mkA4(), mkB4(), identity( 4 ), identity( 4 ), makeSel( 4, [ 1, 2 ] ) );
});

test( 'dtgsen: ijob5_dif_onenorm', function t() {
	runCase( 'ijob5_dif_onenorm', 5, 4, mkA4(), mkB4(), identity( 4 ), identity( 4 ), makeSel( 4, [ 1, 2 ] ) );
});

test( 'dtgsen: all_selected (M=N quick return, ijob=4)', function t() {
	const A = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 1, 2, 0.5 ], [ 1, 3, 0.3 ], [ 2, 2, 2 ], [ 2, 3, 0.4 ], [ 3, 3, 3 ] ] );
	const B = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 1, 2, 0.2 ], [ 1, 3, 0.1 ], [ 2, 2, 1.5 ], [ 2, 3, 0.3 ], [ 3, 3, 2 ] ] );
	runCase( 'all_selected', 4, 3, A, B, identity( 3 ), identity( 3 ), makeSel( 3, [ 1, 2, 3 ] ) );
});

test( 'dtgsen: none_selected (M=0 quick return, ijob=1)', function t() {
	const A = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 1, 2, 0.5 ], [ 1, 3, 0.3 ], [ 2, 2, 2 ], [ 2, 3, 0.4 ], [ 3, 3, 3 ] ] );
	const B = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 1, 2, 0.2 ], [ 1, 3, 0.1 ], [ 2, 2, 1.5 ], [ 2, 3, 0.3 ], [ 3, 3, 2 ] ] );
	runCase( 'none_selected', 1, 3, A, B, identity( 3 ), identity( 3 ), makeSel( 3, [] ) );
});

test( 'dtgsen: n1_trivial', function t() {
	const A = buildMat( 1, 1, [ [ 1, 1, 5 ] ] );
	const B = buildMat( 1, 1, [ [ 1, 1, 2 ] ] );
	runCase( 'n1_trivial', 0, 1, A, B, identity( 1 ), identity( 1 ), makeSel( 1, [ 1 ] ) );
});

test( 'dtgsen: ijob2_dif_frobenius', function t() {
	runCase( 'ijob2_dif_frobenius', 2, 4, mkA4(), mkB4(), identity( 4 ), identity( 4 ), makeSel( 4, [ 1 ] ) );
});

test( 'dtgsen: ijob3_onenorm_plpr', function t() {
	runCase( 'ijob3_onenorm_plpr', 3, 4, mkA4(), mkB4(), identity( 4 ), identity( 4 ), makeSel( 4, [ 1, 2 ] ) );
});

test( 'dtgsen: negative_b_diag (sign-flip path)', function t() {
	const A = buildMat( 3, 3, [ [ 1, 1, 2 ], [ 1, 2, 0.5 ], [ 1, 3, 0.3 ], [ 2, 2, 3 ], [ 2, 3, 0.4 ], [ 3, 3, 1 ] ] );
	const B = buildMat( 3, 3, [ [ 1, 1, -1 ], [ 1, 2, 0.2 ], [ 1, 3, 0.1 ], [ 2, 2, 1.5 ], [ 2, 3, 0.3 ], [ 3, 3, -2 ] ] );
	runCase( 'negative_b_diag', 0, 3, A, B, identity( 3 ), identity( 3 ), makeSel( 3, [ 1 ] ) );
});

test( 'dtgsen: throws RangeError for invalid ijob', function t() {
	const A = identity( 1 );
	const B = identity( 1 );
	const sel = new Uint8Array( 1 );
	const ALPHAR = new Float64Array( 1 );
	const ALPHAI = new Float64Array( 1 );
	const BETA = new Float64Array( 1 );
	const M = new Int32Array( 1 );
	const DIF = new Float64Array( 2 );
	const WORK = new Float64Array( 500 );
	const IWORK = new Int32Array( 500 );
	assert.throws( function throws() {
		dtgsen( -1, true, true, sel, 1, 0, 1, A, 1, 1, 0, B, 1, 1, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, identity( 1 ), 1, 1, 0, identity( 1 ), 1, 1, 0, M, [ 0 ], [ 0 ], DIF, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
	}, RangeError );
});

test( 'dtgsen: throws RangeError for negative N', function t() {
	const A = identity( 1 );
	const B = identity( 1 );
	const sel = new Uint8Array( 1 );
	const ALPHAR = new Float64Array( 1 );
	const ALPHAI = new Float64Array( 1 );
	const BETA = new Float64Array( 1 );
	const M = new Int32Array( 1 );
	const DIF = new Float64Array( 2 );
	const WORK = new Float64Array( 500 );
	const IWORK = new Int32Array( 500 );
	assert.throws( function throws() {
		dtgsen( 0, true, true, sel, 1, 0, -1, A, 1, 1, 0, B, 1, 1, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, identity( 1 ), 1, 1, 0, identity( 1 ), 1, 1, 0, M, [ 0 ], [ 0 ], DIF, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
	}, RangeError );
});

test( 'dtgsen: 2x2 block with B(1,1) = 0 is perturbed by DLAG2 using SAFMIN = SMLNUM*EPS (ticket 0089)', function t() {
	// Reference: SMLNUM = DLAMCH('S')/EPS, and DLAG2 receives SAFMIN = SMLNUM*EPS = 2^-1022. DLAG2 replaces a B diagonal below BMIN = SQRT(SAFMIN)*MAX(|B|) by SIGN(BMIN, B11), so B(1,1) = 0 becomes ~1.49e-154 and the pencil A = [0 1; -1e-154 0], B = diag(0, 1) has a finite complex pair.
	// Expected values from the reference Fortran (DTGSEN IJOB=0, all selected, LAPACK 3.12.0, gfortran): ALPHAR = [0, 0], ALPHAI = [1.63754743014928250, -1.63754743014928250], BETA = [2, 2]. With SAFMIN = 0, DLAG2 does not perturb B(1,1), divides by zero and all three are NaN.
	const A = buildMat( 2, 2, [ [ 1, 2, 1.0 ], [ 2, 1, -1e-154 ] ] );
	const B = buildMat( 2, 2, [ [ 2, 2, 1.0 ] ] );
	const Q = identity( 2 );
	const Z = identity( 2 );
	const ALPHAR = new Float64Array( 2 );
	const ALPHAI = new Float64Array( 2 );
	const BETA = new Float64Array( 2 );
	const M = new Int32Array( 1 );
	const DIF = new Float64Array( 2 );
	const WORK = new Float64Array( 500 );
	const IWORK = new Int32Array( 500 );
	const info = dtgsen( 0, true, true, makeSel( 2, [ 1, 2 ] ), 1, 0, 2,
		A, 1, 2, 0,
		B, 1, 2, 0,
		ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0,
		Q, 1, 2, 0,
		Z, 1, 2, 0,
		M, [ 0 ], [ 0 ], DIF, 1, 0,
		WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( M[ 0 ], 2, 'M' );
	assert.deepEqual( Array.from( ALPHAR ), [ 0.0, 0.0 ], 'ALPHAR' );
	assertArrayClose( ALPHAI, [ 1.63754743014928250, -1.63754743014928250 ], 1e-14, 'ALPHAI' );
	assertArrayClose( BETA, [ 2.0, 2.0 ], 1e-14, 'BETA' );
});

/**
* Calls dtgsen on a 14-by-14 upper triangular pair selecting every other eigenvalue (M = 7, so 2M(N-M) = 98 and 4M(N-M) = 196 exceed 4N+16 = 72).
*
* @private
* @param {integer} ijob - job selector
* @param {Float64Array} WORK - workspace
* @param {Int32Array} IWORK - integer workspace
* @returns {integer} info
*/
function callMinimum( ijob, WORK, IWORK ) {
	const N = 14;
	const A = new Float64Array( N * N );
	const B = new Float64Array( N * N );
	const Q = new Float64Array( N * N );
	const Z = new Float64Array( N * N );
	const SELECT = new Uint8Array( N );
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			A[ i + ( j * N ) ] = ( i === j ) ? j + 1 : 1.0 / ( i + j + 2 );
			B[ i + ( j * N ) ] = ( i === j ) ? 2.0 : 0.5 / ( i + j + 1 );
		}
		Q[ j + ( j * N ) ] = 1.0;
		Z[ j + ( j * N ) ] = 1.0;
		SELECT[ j ] = ( j % 2 === 1 ) ? 1 : 0;
	}
	return dtgsen( ijob, true, true, SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, Q, 1, N, 0, Z, 1, N, 0, new Int32Array( 1 ), new Float64Array( 1 ), new Float64Array( 1 ), new Float64Array( 2 ), 1, 0, WORK, 1, 0, IWORK, 1, 0 );
}

test( 'dtgsen: WORK or IWORK below the reference LWMIN/LIWMIN (with the M(N-M) terms) throws RangeError', function t() {
	assert.throws( function throws() {
		callMinimum( 5, new Float64Array( 195 ), new Int32Array( 98 ) );
	}, RangeError );
	assert.throws( function throws() {
		callMinimum( 5, new Float64Array( 196 ), new Int32Array( 97 ) );
	}, RangeError );
	assert.throws( function throws() {
		callMinimum( 2, new Float64Array( 98 ), new Int32Array( 20 ) );
	}, RangeError );
	assert.throws( function throws() {
		callMinimum( 2, new Float64Array( 99 ), new Int32Array( 19 ) );
	}, RangeError );
	assert.throws( function throws() {
		callMinimum( 0, new Float64Array( 71 ), new Int32Array( 1 ) );
	}, RangeError );
	assert.strictEqual( callMinimum( 5, new Float64Array( 196 ), new Int32Array( 98 ) ), 0, 'the minimum suffices' );
	assert.strictEqual( callMinimum( 2, new Float64Array( 99 ), new Int32Array( 20 ) ), 0, 'the minimum suffices' );
	assert.strictEqual( callMinimum( 0, new Float64Array( 72 ), new Int32Array( 1 ) ), 0, 'the minimum suffices' );
});

test( 'dtgsen: for ijob 1, 2, 4 the minimum is 2M(N-M)+1, not the documented 2M(N-M) (its DTGSYL gets LWORK - 2M(N-M) and rejects less than 1), and that minimum gives the ample-workspace result', function t() {
	// N = 14 with M = 7 selected: 2M(N-M) = 98 exceeds 4N+16 = 72, so the DTGSYL term decides:
	function run( ijob, lwork ) {
		const N = 14;
		const A = new Float64Array( N * N );
		const B = new Float64Array( N * N );
		const Q = new Float64Array( N * N );
		const Z = new Float64Array( N * N );
		const SELECT = new Uint8Array( N );
		const WORK = new Float64Array( lwork );
		const DIF = new Float64Array( 2 );
		const pl = new Float64Array( 1 );
		const pr = new Float64Array( 1 );
		let info;
		let i;
		let j;
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i <= j; i++ ) {
				A[ i + ( j * N ) ] = ( i === j ) ? j + 1 : 1.0 / ( i + j + 2 );
				B[ i + ( j * N ) ] = ( i === j ) ? 2.0 : 0.5 / ( i + j + 1 );
			}
			Q[ j + ( j * N ) ] = 1.0;
			Z[ j + ( j * N ) ] = 1.0;
			SELECT[ j ] = ( j % 2 === 1 ) ? 1 : 0;
		}
		WORK.fill( NaN );
		info = dtgsen( ijob, true, true, SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, Q, 1, N, 0, Z, 1, N, 0, new Int32Array( 1 ), pl, pr, DIF, 1, 0, WORK, 1, 0, new Int32Array( 40 ), 1, 0 );
		return [ info, pl[ 0 ], pr[ 0 ] ].concat( Array.from( DIF ), Array.from( A ), Array.from( B ), Array.from( Q ), Array.from( Z ) );
	}
	const ijobs = [ 1, 2, 4 ];
	let ample;
	let got;
	let k;
	let i;
	for ( k = 0; k < ijobs.length; k++ ) {
		assert.throws( function throws() {
			run( ijobs[ k ], 98 );
		}, /WORK array must have at least 99 elements/, 'ijob ' + ijobs[ k ] + ': the documented 2M(N-M)' );
		ample = run( ijobs[ k ], 1000 );
		got = run( ijobs[ k ], 99 );
		assert.strictEqual( got[ 0 ], 0, 'ijob ' + ijobs[ k ] + ': info' );
		for ( i = 0; i < ample.length; i++ ) {
			assert.ok( got[ i ] === ample[ i ] || Math.abs( got[ i ] - ample[ i ] ) <= 1e-13 * Math.max( 1.0, Math.abs( ample[ i ] ) ), 'ijob ' + ijobs[ k ] + ': output ' + i + ': ' + got[ i ] + ' vs ' + ample[ i ] );
		}
	}
});
