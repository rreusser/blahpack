/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtgex2 from './../lib/dtgex2.js';
import strided from './../lib/strided.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'dtgex2.jsonl' ), 'utf8' ).trim().split( '\n' );
let SWAP21;
let k;
for ( k = 0; k < lines.length; k++ ) {
	if ( JSON.parse( lines[ k ] ).name === 'swap_2x2_1x1' ) {
		SWAP21 = JSON.parse( lines[ k ] );
	}
}


// VARIABLES //

// Inputs of the `swap_2x2_1x1` fixture case (N=4, n1=2, n2=1, j1=0), column-major:
const N = 4;
const A0 = [ 1.0, -0.5, 0.0, 0.0, 0.5, 1.0, 0.0, 0.0, 0.3, 0.2, 3.0, 0.0, 0.1, 0.15, 0.4, 4.0 ];
const B0 = [ 2.0, 0.0, 0.0, 0.0, 0.3, 2.5, 0.0, 0.0, 0.1, 0.2, 3.0, 0.0, 0.05, 0.1, 0.3, 1.5 ];
const I4 = [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];


// FUNCTIONS //

/**
* Transposes a square N-by-N matrix stored in a flat array.
*
* @private
* @param {Collection} src - input
* @returns {Float64Array} transposed copy
*/
function transpose( src ) {
	const out = new Float64Array( N * N );
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			out[ ( i * N ) + j ] = src[ ( j * N ) + i ];
		}
	}
	return out;
}

/**
* Asserts that two arrays are identical.
*
* @private
* @param {Collection} a - actual
* @param {Collection} b - expected
* @param {string} msg - message
*/
function assertSame( a, b, msg ) {
	let i;
	assert.strictEqual( a.length, b.length, msg );
	for ( i = 0; i < a.length; i++ ) {
		assert.strictEqual( a[ i ], b[ i ], msg + '[' + i + ']' );
	}
}

/**
* Asserts that two arrays agree element-wise to a tolerance.
*
* @private
* @param {Collection} a - actual
* @param {Collection} b - expected
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertClose( a, b, tol, msg ) {
	let i;
	assert.strictEqual( a.length, b.length, msg );
	for ( i = 0; i < b.length; i++ ) {
		assert.ok( Math.abs( a[ i ] - b[ i ] ) <= tol * Math.max( Math.abs( b[ i ] ), 1.0 ), msg + '[' + i + ']: expected ' + b[ i ] + ', got ' + a[ i ] );
	}
}

/**
* Runs the wrapper and the strided API on the fixture inputs and checks both.
*
* @private
* @param {string} order - storage layout
* @param {boolean} nullWork - whether the wrapper gets a null workspace
*/
function compare( order, nullWork ) {
	const rm = ( order === 'row-major' );
	const prep = ( rm ) ? transpose : function id( x ) {
		return new Float64Array( x );
	};
	const A1 = prep( A0 );
	const B1 = prep( B0 );
	const Q1 = prep( I4 );
	const Z1 = prep( I4 );
	const A2 = prep( A0 );
	const B2 = prep( B0 );
	const Q2 = prep( I4 );
	const Z2 = prep( I4 );
	const s1 = ( rm ) ? N : 1;
	const s2 = ( rm ) ? 1 : N;
	const info1 = dtgex2( order, true, true, N, A1, N, B1, N, Q1, N, Z1, N, 0, 2, 1, ( nullWork ) ? null : new Float64Array( 32 ) );
	const info2 = strided( true, true, N, A2, s1, s2, 0, B2, s1, s2, 0, Q2, s1, s2, 0, Z2, s1, s2, 0, 0, 2, 1, new Float64Array( 32 ), 1, 0 );
	const back = ( rm ) ? transpose : function id( x ) {
		return x;
	};
	assert.strictEqual( info1, SWAP21.info );
	assert.strictEqual( info2, SWAP21.info );
	assertSame( A1, A2, 'A' );
	assertSame( B1, B2, 'B' );
	assertSame( Q1, Q2, 'Q' );
	assertSame( Z1, Z2, 'Z' );
	assertClose( back( A1 ), SWAP21.A, 1e-13, 'A' );
	assertClose( back( B1 ), SWAP21.B, 1e-13, 'B' );
	assertClose( back( Q1 ), SWAP21.Q, 1e-13, 'Q' );
	assertClose( back( Z1 ), SWAP21.Z, 1e-13, 'Z' );
}


// TESTS //

test( 'dtgex2 is a function', function t() {
	assert.strictEqual( typeof dtgex2, 'function', 'is a function' );
});

test( 'dtgex2 has expected arity', function t() {
	assert.strictEqual( dtgex2.length, 16, 'has expected arity' );
});

test( 'dtgex2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtgex2( 'invalid', true, true, N, new Float64Array( A0 ), N, new Float64Array( B0 ), N, new Float64Array( I4 ), N, new Float64Array( I4 ), N, 0, 2, 1, null );
	}, TypeError );
});

test( 'dtgex2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtgex2( 'column-major', true, true, -1, new Float64Array( A0 ), N, new Float64Array( B0 ), N, new Float64Array( I4 ), N, new Float64Array( I4 ), N, 0, 2, 1, null );
	}, RangeError );
});

test( 'dtgex2 (column-major, provided workspace) matches strided and the fixture', function t() {
	compare( 'column-major', false );
});

test( 'dtgex2 (column-major, null workspace) matches strided and the fixture', function t() {
	compare( 'column-major', true );
});

test( 'dtgex2 (row-major, provided workspace) matches strided and the fixture', function t() {
	compare( 'row-major', false );
});

test( 'dtgex2 (row-major, null workspace) matches strided and the fixture', function t() {
	compare( 'row-major', true );
});
