/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlaeda from './../lib/dlaeda.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'dlaeda.jsonl' ), 'utf8' ).trim().split( '\n' );
const fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );


// FUNCTIONS //

function findCase( name ) {
	return fixture.find( function find( t ) { return t.name === name; } );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let relErr, i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

/**
* Fill an m-by-n column-major block starting at q[start] with 10*(i+1)+(j+1)+off.
*
* @private
* @param {Float64Array} q - destination
* @param {NonNegativeInteger} start - starting index (0-based)
* @param {NonNegativeInteger} m - row count
* @param {NonNegativeInteger} n - column count
* @param {number} off - additive offset
*/
function fillBlock( q, start, m, n, off ) {
	let i, j, k;
	k = 0;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			q[ start + k ] = ( 10 * ( i + 1 ) ) + ( j + 1 ) + off;
			k += 1;
		}
	}
}

/**
* Returns the inputs of the `two_level_n8_givens` fixture case.
*
* @private
* @returns {Object} inputs
*/
function givensCase() {
	const q = new Float64Array( 40 );
	fillBlock( q, 0, 4, 4, 0.0 );
	fillBlock( q, 16, 4, 4, 100.0 );
	q[ 32 ] = 1.0; q[ 33 ] = 0.0; q[ 34 ] = 0.0; q[ 35 ] = 1.0;
	q[ 36 ] = 0.6; q[ 37 ] = 0.8; q[ 38 ] = -0.8; q[ 39 ] = 0.6;
	return {
		'QPTR': new Int32Array( [ 0, 1, 17, 33, 33, 37, 41 ] ),
		'q': q,
		'PRMPTR': new Int32Array( [ 0, 0, 0, 0, 1, 5, 9 ] ),
		'PERM': new Int32Array( [ 1, 2, 3, 4, 1, 2, 3, 4 ] ),
		'GIVPTR': new Int32Array( [ 0, 0, 0, 0, 1, 2, 3 ] ),

		// 2-by-3, column-major:
		'GIVCOL': new Int32Array( [ 1, 2, 1, 2, 0, 0 ] ),
		'GIVNUM': new Float64Array( [ 0.6, 0.8, 0.6, 0.8, 0.0, 0.0 ] )
	};
}

function reverse( x ) {
	return x.slice().reverse();
}

function reverseInterleaved( x, stride ) {
	const out = new x.constructor( x.length * stride );
	let i;
	for ( i = 0; i < x.length; i++ ) {
		out[ ( x.length - 1 - i ) * stride ] = x[ i ];
	}
	return out;
}


// TESTS //

test( 'dlaeda is a function', function t() {
	assert.strictEqual( typeof dlaeda, 'function', 'is a function' );
});

test( 'dlaeda has expected arity', function t() {
	assert.strictEqual( dlaeda.length, 23, 'has expected arity' );
});

test( 'dlaeda throws TypeError for invalid order', function t() {
	const c = givensCase();
	assert.throws( function throws() {
		dlaeda( 'invalid', 8, 2, 2, 0, c.PRMPTR, 1, c.PERM, 1, c.GIVPTR, 1, c.GIVCOL, 2, c.GIVNUM, 2, c.q, 1, c.QPTR, 1, new Float64Array( 8 ), 1, new Float64Array( 8 ), 1 );
	}, TypeError );
});

test( 'dlaeda throws RangeError for negative N', function t() {
	const c = givensCase();
	assert.throws( function throws() {
		dlaeda( 'column-major', -1, 2, 2, 0, c.PRMPTR, 1, c.PERM, 1, c.GIVPTR, 1, c.GIVCOL, 2, c.GIVNUM, 2, c.q, 1, c.QPTR, 1, new Float64Array( 8 ), 1, new Float64Array( 8 ), 1 );
	}, RangeError );
});

test( 'dlaeda throws RangeError for column-major LDGIVCOL < 2', function t() {
	const c = givensCase();
	assert.throws( function throws() {
		dlaeda( 'column-major', 8, 2, 2, 0, c.PRMPTR, 1, c.PERM, 1, c.GIVPTR, 1, c.GIVCOL, 1, c.GIVNUM, 2, c.q, 1, c.QPTR, 1, new Float64Array( 8 ), 1, new Float64Array( 8 ), 1 );
	}, RangeError );
});

test( 'dlaeda throws RangeError for column-major LDGIVNUM < 2', function t() {
	const c = givensCase();
	assert.throws( function throws() {
		dlaeda( 'column-major', 8, 2, 2, 0, c.PRMPTR, 1, c.PERM, 1, c.GIVPTR, 1, c.GIVCOL, 2, c.GIVNUM, 1, c.q, 1, c.QPTR, 1, new Float64Array( 8 ), 1, new Float64Array( 8 ), 1 );
	}, RangeError );
});

test( 'dlaeda: column-major matches fixture (two_level_n8_givens)', function t() {
	const tc = findCase( 'two_level_n8_givens' );
	const c = givensCase();
	const z = new Float64Array( 8 );
	const info = dlaeda( 'column-major', 8, 2, 2, 0, c.PRMPTR, 1, c.PERM, 1, c.GIVPTR, 1, c.GIVCOL, 2, c.GIVNUM, 2, c.q, 1, c.QPTR, 1, z, 1, new Float64Array( 8 ), 1 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( z, tc.Z, 1e-12, 'Z' );
});

test( 'dlaeda: column-major with padded leading dimensions', function t() {
	const tc = findCase( 'two_level_n8_givens' );
	const c = givensCase();
	const z = new Float64Array( 8 );
	const GIVCOL = new Int32Array( [ 1, 2, -9, 1, 2, -9, 0, 0, -9 ] );
	const GIVNUM = new Float64Array( [ 0.6, 0.8, NaN, 0.6, 0.8, NaN, 0.0, 0.0, NaN ] );
	const info = dlaeda( 'column-major', 8, 2, 2, 0, c.PRMPTR, 1, c.PERM, 1, c.GIVPTR, 1, GIVCOL, 3, GIVNUM, 3, c.q, 1, c.QPTR, 1, z, 1, new Float64Array( 8 ), 1 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( z, tc.Z, 1e-12, 'Z' );
});

test( 'dlaeda: row-major GIVCOL/GIVNUM match fixture', function t() {
	const tc = findCase( 'two_level_n8_givens' );
	const c = givensCase();
	const z = new Float64Array( 8 );

	// 2-by-3 row-major, LD = 4 (padded):
	const GIVCOL = new Int32Array( [ 1, 1, 0, -9, 2, 2, 0, -9 ] );
	const GIVNUM = new Float64Array( [ 0.6, 0.6, 0.0, NaN, 0.8, 0.8, 0.0, NaN ] );
	const info = dlaeda( 'row-major', 8, 2, 2, 0, c.PRMPTR, 1, c.PERM, 1, c.GIVPTR, 1, GIVCOL, 4, GIVNUM, 4, c.q, 1, c.QPTR, 1, z, 1, new Float64Array( 8 ), 1 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( z, tc.Z, 1e-12, 'Z' );
});

test( 'dlaeda: negative vector strides (reversed buffers) reproduce the unit-stride result', function t() {
	const tc = findCase( 'two_level_n8_givens' );
	const c = givensCase();
	const z = new Float64Array( 8 );
	const info = dlaeda( 'column-major', 8, 2, 2, 0, reverse( c.PRMPTR ), -1, reverse( c.PERM ), -1, reverse( c.GIVPTR ), -1, c.GIVCOL, 2, c.GIVNUM, 2, reverse( c.q ), -1, reverse( c.QPTR ), -1, z, -1, new Float64Array( 8 ), -1 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( reverse( z ), tc.Z, 1e-12, 'Z' );
});

test( 'dlaeda: non-unit vector strides reproduce the unit-stride result', function t() {
	const tc = findCase( 'two_level_n8_givens' );
	const c = givensCase();
	const z = new Float64Array( 16 );
	const out = new Float64Array( 8 );
	let i;
	const info = dlaeda( 'column-major', 8, 2, 2, 0, reverseInterleaved( c.PRMPTR, 2 ), -2, reverseInterleaved( c.PERM, 3 ), -3, reverseInterleaved( c.GIVPTR, 2 ), -2, c.GIVCOL, 2, c.GIVNUM, 2, reverseInterleaved( c.q, 2 ), -2, reverseInterleaved( c.QPTR, 3 ), -3, z, 2, new Float64Array( 24 ), 3 );
	for ( i = 0; i < 8; i++ ) {
		out[ i ] = z[ 2 * i ];
	}
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( out, tc.Z, 1e-12, 'Z' );
});

test( 'dlaeda: N=0 quick return', function t() {
	const c = givensCase();
	const info = dlaeda( 'column-major', 0, 2, 2, 0, c.PRMPTR, 1, c.PERM, 1, c.GIVPTR, 1, c.GIVCOL, 2, c.GIVNUM, 2, c.q, 1, c.QPTR, 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1 );
	assert.equal( info, 0, 'INFO' );
});
