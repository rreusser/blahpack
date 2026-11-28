
/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlamtsqr from './../lib/zlamtsqr.js';
import strided from './../lib/strided.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', 'test', 'fixtures' );
const rawLines = readFileSync( path.join( fixtureDir, 'zlamtsqr.jsonl' ), 'utf8' ).trim().split( '\n' );
const fixture = rawLines.map( parseLine );


// FUNCTIONS //

/**
* Parse a JSON line into a fixture case.
*
* @private
* @param {string} line - JSON-encoded fixture case
* @returns {Object} parsed fixture case
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Locate a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return fixture.find( matchByName );

	/**
	* Whether a candidate case matches the desired name.
	*
	* @private
	* @param {Object} t - candidate case
	* @returns {boolean} true if names match
	*/
	function matchByName( t ) {
		return t.name === name;
	}
}

/**
* Copies a column-major interleaved complex matrix into a Complex128Array with the requested layout.
*
* @private
* @param {Array} flat - column-major interleaved values (leading dimension `rows`)
* @param {NonNegativeInteger} rows - number of rows
* @param {NonNegativeInteger} cols - number of columns
* @param {boolean} rowMajor - whether to store the result in row-major order
* @returns {Complex128Array} matrix
*/
function toLayout( flat, rows, cols, rowMajor ) {
	let src;
	let dst;
	let i;
	let j;

	const out = new Complex128Array( rows * cols );
	const v = reinterpret( out, 0 );
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			src = 2 * ( i + ( j * rows ) );
			dst = ( rowMajor ) ? 2 * ( ( i * cols ) + j ) : src;
			v[ dst ] = flat[ src ];
			v[ dst + 1 ] = flat[ src + 1 ];
		}
	}
	return out;
}

/**
* Runs the layout wrapper and `strided` on the same fixture data and compares the results.
*
* @private
* @param {string} name - fixture case name
* @param {string} order - storage layout
* @param {string} side - operation side
* @param {string} trans - transpose operation
*/
function compareWrapper( name, order, side, trans ) {
	let info2;
	let info;
	let tc;
	let C2;
	let rm;
	let nA;
	let nT;
	let A;
	let T;
	let C;
	let i;
	let j;
	let v;
	let w;

	tc = findCase( name );
	rm = ( order === 'row-major' );
	nA = ( side === 'left' ) ? tc.M : tc.N;
	nT = tc.T.length / 2 / tc.LDT;
	A = toLayout( tc.A, nA, tc.K, rm );
	T = toLayout( tc.T, tc.LDT, nT, rm );
	C = toLayout( tc.C0, tc.M, tc.N, rm );
	C2 = toLayout( tc.C0, tc.M, tc.N, rm );

	if ( rm ) {
		info = zlamtsqr( order, side, trans, tc.M, tc.N, tc.K, tc.MB, tc.NB, A, tc.K, T, nT, C, tc.N, null );
		info2 = strided( side, trans, tc.M, tc.N, tc.K, tc.MB, tc.NB, A, tc.K, 1, 0, T, nT, 1, 0, C2, tc.N, 1, 0, new Complex128Array( Math.max( tc.M, tc.N ) * tc.NB ), 1, 0 );
	} else {
		info = zlamtsqr( order, side, trans, tc.M, tc.N, tc.K, tc.MB, tc.NB, A, nA, T, tc.LDT, C, tc.M, null );
		info2 = strided( side, trans, tc.M, tc.N, tc.K, tc.MB, tc.NB, A, 1, nA, 0, T, 1, tc.LDT, 0, C2, 1, tc.M, 0, new Complex128Array( Math.max( tc.M, tc.N ) * tc.NB ), 1, 0 );
	}
	assert.strictEqual( info, 0, name + ': info' );
	assert.strictEqual( info2, 0, name + ': strided info' );
	v = reinterpret( C, 0 );
	w = reinterpret( C2, 0 );
	for ( i = 0; i < v.length; i++ ) {
		assert.strictEqual( v[ i ], w[ i ], name + ': C[' + i + '] matches strided' );
	}

	// Cross-check against the Fortran reference output:
	for ( j = 0; j < tc.N; j++ ) {
		for ( i = 0; i < tc.M; i++ ) {
			const src = 2 * ( i + ( j * tc.M ) );
			const dst = ( rm ) ? 2 * ( ( i * tc.N ) + j ) : src;
			assert.ok( Math.abs( v[ dst ] - tc.C[ src ] ) <= 1e-12 * Math.max( 1.0, Math.abs( tc.C[ src ] ) ), name + ': re(C) vs reference' );
			assert.ok( Math.abs( v[ dst + 1 ] - tc.C[ src + 1 ] ) <= 1e-12 * Math.max( 1.0, Math.abs( tc.C[ src + 1 ] ) ), name + ': im(C) vs reference' );
		}
	}
}


// TESTS //

test( 'zlamtsqr is a function', function t() {
	assert.strictEqual( typeof zlamtsqr, 'function', 'is a function' );
});

test( 'zlamtsqr has expected arity', function t() {
	assert.strictEqual( zlamtsqr.length, 15, 'has expected arity' );
});

test( 'zlamtsqr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlamtsqr( 'invalid', 'left', 'no-transpose', 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlamtsqr throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zlamtsqr( 'row-major', 'invalid', 'no-transpose', 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlamtsqr throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zlamtsqr( 'row-major', 'left', 'invalid', 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlamtsqr rejects plain "transpose" (Q is unitary)', function t() {
	assert.throws( function throws() {
		zlamtsqr( 'column-major', 'left', 'transpose', 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlamtsqr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlamtsqr( 'row-major', 'left', 'no-transpose', -1, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zlamtsqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlamtsqr( 'row-major', 'left', 'no-transpose', 2, -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zlamtsqr throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zlamtsqr( 'row-major', 'left', 'no-transpose', 2, 2, -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zlamtsqr throws RangeError for row-major LDA < K', function t() {
	assert.throws( function throws() {
		zlamtsqr( 'row-major', 'left', 'no-transpose', 4, 2, 2, 2, 2, new Complex128Array( 8 ), 1, new Complex128Array( 8 ), 2, new Complex128Array( 8 ), 2, null );
	}, RangeError );
});

test( 'zlamtsqr (column-major, left, no-transpose) matches strided and reference', function t() {
	compareWrapper( 'left_notrans_blocked', 'column-major', 'left', 'no-transpose' );
});

test( 'zlamtsqr (row-major, left, no-transpose) matches strided and reference', function t() {
	compareWrapper( 'left_notrans_blocked', 'row-major', 'left', 'no-transpose' );
});

test( 'zlamtsqr (column-major, right, conjugate-transpose) matches strided and reference', function t() {
	compareWrapper( 'right_ctrans_blocked', 'column-major', 'right', 'conjugate-transpose' );
});

test( 'zlamtsqr (row-major, right, conjugate-transpose) matches strided and reference', function t() {
	compareWrapper( 'right_ctrans_blocked', 'row-major', 'right', 'conjugate-transpose' );
});

test( 'zlamtsqr: side=right with N = 0 quick-returns like strided.js and the reference (no K <= N check; ticket 0074)', function t() {
	// The reference (zlamtsqr.f) checks M >= K, not K <= N, and returns when MIN(M,N,K) = 0.
	const A = new Complex128Array( 3 );
	const T = new Complex128Array( 6 );
	const C = new Complex128Array( 5 );
	const info = zlamtsqr( 'column-major', 'right', 'no-transpose', 5, 0, 3, 5, 2, A, 1, T, 2, C, 5, null );
	const info2 = strided( 'right', 'no-transpose', 5, 0, 3, 5, 2, A, 1, 1, 0, T, 1, 2, 0, C, 1, 5, 0, new Complex128Array( 10 ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( info, info2 );
});
