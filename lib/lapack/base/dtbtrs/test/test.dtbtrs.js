/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtbtrs from './../lib/dtbtrs.js';
import ndarray from './../lib/ndarray.js';
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };


// VARIABLES //

// Upper band A (N=3, kd=1), column-major with LDAB=2; B is 3x2 column-major:
const AB = [ 0, 3, 1, 4, 2, 5 ];
const B = [ 1, 2, 3, 7, 8, 9 ];
const XREF = multi_rhs.x;


// FUNCTIONS //

/**
* Converts a column-major matrix (leading dimension `M`) to row-major.
*
* @private
* @param {Array} src - column-major data
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @returns {Float64Array} row-major data
*/
function toRowMajor( src, M, N ) {
	const out = new Float64Array( M * N );
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out[ ( i * N ) + j ] = src[ ( j * M ) + i ];
		}
	}
	return out;
}

/**
* Asserts that two arrays agree element-wise to a relative tolerance.
*
* @private
* @param {Collection} actual - actual values
* @param {Collection} expected - expected values
* @param {number} tol - relative tolerance
*/
function assertClose( actual, expected, tol ) {
	let i;
	assert.strictEqual( actual.length, expected.length );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( actual[ i ] - expected[ i ] ) <= tol * Math.max( Math.abs( expected[ i ] ), 1.0 ), 'index ' + i + ': expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

/**
* Asserts that two arrays are identical.
*
* @private
* @param {Collection} a - actual
* @param {Collection} b - expected
*/
function assertSame( a, b ) {
	let i;
	assert.strictEqual( a.length, b.length );
	for ( i = 0; i < a.length; i++ ) {
		assert.strictEqual( a[ i ], b[ i ], 'index ' + i );
	}
}

/**
* Calls the wrapper with valid arguments, overriding selected ones.
*
* @private
* @param {Object} o - overrides
* @returns {integer} info
*/
function call( o ) {
	const a = {
		'order': 'column-major',
		'uplo': 'upper',
		'trans': 'no-transpose',
		'diag': 'non-unit',
		'N': 3,
		'kd': 1,
		'nrhs': 2,
		'LDAB': 2,
		'LDB': 3
	};
	let k;
	for ( k in o ) {
		if ( Object.prototype.hasOwnProperty.call( o, k ) ) {
			a[ k ] = o[ k ];
		}
	}
	return dtbtrs( a.order, a.uplo, a.trans, a.diag, a.N, a.kd, a.nrhs, new Float64Array( AB ), a.LDAB, new Float64Array( B ), a.LDB );
}


// TESTS //

test( 'dtbtrs is a function', function t() {
	assert.strictEqual( typeof dtbtrs, 'function', 'is a function' );
});

test( 'dtbtrs has expected arity', function t() {
	assert.strictEqual( dtbtrs.length, 11, 'has expected arity' );
});

test( 'dtbtrs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		call({
			'order': 'invalid'
		});
	}, TypeError );
});

test( 'dtbtrs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		call({
			'uplo': 'invalid'
		});
	}, TypeError );
});

test( 'dtbtrs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		call({
			'trans': 'invalid'
		});
	}, TypeError );
});

test( 'dtbtrs throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		call({
			'diag': 'invalid'
		});
	}, TypeError );
});

test( 'dtbtrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		call({
			'N': -1
		});
	}, RangeError );
});

test( 'dtbtrs throws RangeError for negative kd', function t() {
	assert.throws( function throws() {
		call({
			'kd': -1
		});
	}, RangeError );
});

test( 'dtbtrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		call({
			'nrhs': -1
		});
	}, RangeError );
});

test( 'dtbtrs throws RangeError for too-small LDAB (column-major)', function t() {
	assert.throws( function throws() {
		call({
			'LDAB': 1
		});
	}, RangeError );
});

test( 'dtbtrs throws RangeError for too-small LDAB (row-major)', function t() {
	assert.throws( function throws() {
		call({
			'order': 'row-major',
			'LDAB': 2,
			'LDB': 2
		});
	}, RangeError );
});

test( 'dtbtrs throws RangeError for too-small LDB (column-major)', function t() {
	assert.throws( function throws() {
		call({
			'LDB': 2
		});
	}, RangeError );
});

test( 'dtbtrs throws RangeError for too-small LDB (row-major)', function t() {
	assert.throws( function throws() {
		call({
			'order': 'row-major',
			'LDAB': 3,
			'LDB': 1
		});
	}, RangeError );
});

test( 'dtbtrs (column-major) matches ndarray and the fixture', function t() {
	const B1 = new Float64Array( B );
	const B2 = new Float64Array( B );
	const info1 = dtbtrs( 'column-major', 'upper', 'no-transpose', 'non-unit', 3, 1, 2, new Float64Array( AB ), 2, B1, 3 );
	const info2 = ndarray( 'upper', 'no-transpose', 'non-unit', 3, 1, 2, new Float64Array( AB ), 1, 2, 0, B2, 1, 3, 0 );
	assert.strictEqual( info1, 0 );
	assert.strictEqual( info2, 0 );
	assertSame( B1, B2 );
	assertClose( B1, XREF, 1e-13 );
});

test( 'dtbtrs (row-major) matches ndarray and the fixture', function t() {
	const A = toRowMajor( AB, 2, 3 );
	const B1 = new Float64Array( toRowMajor( B, 3, 2 ) );
	const B2 = new Float64Array( toRowMajor( B, 3, 2 ) );
	const info1 = dtbtrs( 'row-major', 'upper', 'no-transpose', 'non-unit', 3, 1, 2, new Float64Array( A ), 3, B1, 2 );
	const info2 = ndarray( 'upper', 'no-transpose', 'non-unit', 3, 1, 2, new Float64Array( A ), 3, 1, 0, B2, 2, 1, 0 );
	assert.strictEqual( info1, 0 );
	assert.strictEqual( info2, 0 );
	assertSame( B1, B2 );
	assertClose( B1, toRowMajor( XREF, 3, 2 ), 1e-13 );
});

test( 'dtbtrs (row-major, transpose) matches ndarray', function t() {
	const A = toRowMajor( AB, 2, 3 );
	const B1 = new Float64Array( toRowMajor( B, 3, 2 ) );
	const B2 = new Float64Array( toRowMajor( B, 3, 2 ) );
	const info1 = dtbtrs( 'row-major', 'upper', 'transpose', 'non-unit', 3, 1, 2, new Float64Array( A ), 3, B1, 2 );
	const info2 = ndarray( 'upper', 'transpose', 'non-unit', 3, 1, 2, new Float64Array( A ), 3, 1, 0, B2, 2, 1, 0 );
	assert.strictEqual( info1, info2 );
	assertSame( B1, B2 );
});
