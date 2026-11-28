/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztbmv from './../lib/ztbmv.js';
import strided from './../lib/strided.js';
import upper_no_trans_nonunit from './fixtures/upper_no_trans_nonunit.json' with { type: 'json' };


// VARIABLES //

// Upper band A (N=4, K=2), column-major with LDA=3, interleaved re/im:
const AB = [ 0, 0, 0, 0, 2, 1, 0, 0, 1, 0.5, 3, -1, 4, 2, 5, 0, 6, -0.5, 0, 0, 7, 1, 8, -2 ];
const XV = [ 1, 0, 2, 1, 3, -1, 4, 0.5 ];


// FUNCTIONS //

/**
* Converts a column-major complex matrix (interleaved, leading dimension `M`) to row-major.
*
* @private
* @param {Array} src - column-major interleaved data
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @returns {Float64Array} row-major interleaved data
*/
function toRowMajor( src, M, N ) {
	const out = new Float64Array( 2 * M * N );
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out[ 2 * ( ( i * N ) + j ) ] = src[ 2 * ( ( j * M ) + i ) ];
			out[ ( 2 * ( ( i * N ) + j ) ) + 1 ] = src[ ( 2 * ( ( j * M ) + i ) ) + 1 ];
		}
	}
	return out;
}

/**
* Asserts that two Float64Arrays are identical.
*
* @private
* @param {Float64Array} a - actual
* @param {Float64Array} b - expected
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
* @returns {Complex128Array} output
*/
function call( o ) {
	const a = {
		'order': 'column-major',
		'uplo': 'upper',
		'trans': 'no-transpose',
		'diag': 'non-unit',
		'N': 4,
		'K': 2,
		'LDA': 3,
		'strideX': 1
	};
	let k;
	for ( k in o ) {
		if ( Object.prototype.hasOwnProperty.call( o, k ) ) {
			a[ k ] = o[ k ];
		}
	}
	return ztbmv( a.order, a.uplo, a.trans, a.diag, a.N, a.K, new Complex128Array( AB ), a.LDA, new Complex128Array( XV ), a.strideX );
}


// TESTS //

test( 'ztbmv is a function', function t() {
	assert.strictEqual( typeof ztbmv, 'function', 'is a function' );
});

test( 'ztbmv has expected arity', function t() {
	assert.strictEqual( ztbmv.length, 10, 'has expected arity' );
});

test( 'ztbmv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		call({
			'order': 'invalid'
		});
	}, TypeError );
});

test( 'ztbmv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		call({
			'uplo': 'invalid'
		});
	}, TypeError );
});

test( 'ztbmv throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		call({
			'trans': 'invalid'
		});
	}, TypeError );
});

test( 'ztbmv throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		call({
			'diag': 'invalid'
		});
	}, TypeError );
});

test( 'ztbmv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		call({
			'N': -1
		});
	}, RangeError );
});

test( 'ztbmv throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		call({
			'K': -1
		});
	}, RangeError );
});

test( 'ztbmv throws RangeError for too-small LDA (column-major)', function t() {
	assert.throws( function throws() {
		call({
			'LDA': 2
		});
	}, RangeError );
});

test( 'ztbmv throws RangeError for too-small LDA (row-major)', function t() {
	assert.throws( function throws() {
		call({
			'order': 'row-major',
			'LDA': 3
		});
	}, RangeError );
});

test( 'ztbmv throws RangeError for zero strideX', function t() {
	assert.throws( function throws() {
		call({
			'strideX': 0
		});
	}, RangeError );
});

test( 'ztbmv (column-major) matches strided and the fixture', function t() {
	const x1 = new Complex128Array( XV );
	const x2 = new Complex128Array( XV );
	const out = ztbmv( 'column-major', 'upper', 'no-transpose', 'non-unit', 4, 2, new Complex128Array( AB ), 3, x1, 1 );
	strided( 'upper', 'no-transpose', 'non-unit', 4, 2, new Complex128Array( AB ), 1, 3, 0, x2, 1, 0 );
	assert.strictEqual( out, x1 );
	assertSame( reinterpret( x1, 0 ), reinterpret( x2, 0 ) );
	assertSame( reinterpret( x1, 0 ), new Float64Array( upper_no_trans_nonunit.x ) );
});

test( 'ztbmv (row-major) matches strided and the fixture', function t() {
	const A = toRowMajor( AB, 3, 4 );
	const x1 = new Complex128Array( XV );
	const x2 = new Complex128Array( XV );
	const out = ztbmv( 'row-major', 'upper', 'no-transpose', 'non-unit', 4, 2, new Complex128Array( A ), 4, x1, 1 );
	strided( 'upper', 'no-transpose', 'non-unit', 4, 2, new Complex128Array( A ), 4, 1, 0, x2, 1, 0 );
	assert.strictEqual( out, x1 );
	assertSame( reinterpret( x1, 0 ), reinterpret( x2, 0 ) );
	assertSame( reinterpret( x1, 0 ), new Float64Array( upper_no_trans_nonunit.x ) );
});

test( 'ztbmv (row-major, conjugate-transpose, negative stride) matches strided', function t() {
	const A = toRowMajor( AB, 3, 4 );
	const x1 = new Complex128Array( XV );
	const x2 = new Complex128Array( XV );
	ztbmv( 'row-major', 'upper', 'conjugate-transpose', 'non-unit', 4, 2, new Complex128Array( A ), 4, x1, -1 );
	strided( 'upper', 'conjugate-transpose', 'non-unit', 4, 2, new Complex128Array( A ), 4, 1, 0, x2, -1, 3 );
	assertSame( reinterpret( x1, 0 ), reinterpret( x2, 0 ) );
});
