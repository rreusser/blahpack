/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dtbrfs from './../lib/dtbrfs.js';
import ndarray from './../lib/ndarray.js';
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };


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
* Returns test data: upper band A (kd=2, N=4), two right-hand sides, and the solution.
*
* @private
* @returns {Object} data
*/
function data() {
	return {
		'AB': [ 0, 0, 2, 0, 1, 4, 3, 5, 6, 2, 1, 3 ],
		'B': [ 13, 31, 22, 12, 31, 64, 43, 21 ],
		'X': multi_rhs.x.slice()
	};
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
		'N': 4,
		'kd': 2,
		'nrhs': 2,
		'LDAB': 3,
		'LDB': 4,
		'LDX': 4
	};
	const d = data();
	let k;
	for ( k in o ) {
		if ( Object.prototype.hasOwnProperty.call( o, k ) ) {
			a[ k ] = o[ k ];
		}
	}
	return dtbrfs( a.order, a.uplo, a.trans, a.diag, a.N, a.kd, a.nrhs, new Float64Array( d.AB ), a.LDAB, new Float64Array( d.B ), a.LDB, new Float64Array( d.X ), a.LDX, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, null, null );
}


// TESTS //

test( 'dtbrfs is a function', function t() {
	assert.strictEqual( typeof dtbrfs, 'function', 'is a function' );
});

test( 'dtbrfs has expected arity', function t() {
	assert.strictEqual( dtbrfs.length, 19, 'has expected arity' );
});

test( 'dtbrfs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		call({
			'order': 'invalid'
		});
	}, TypeError );
});

test( 'dtbrfs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		call({
			'uplo': 'invalid'
		});
	}, TypeError );
});

test( 'dtbrfs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		call({
			'trans': 'invalid'
		});
	}, TypeError );
});

test( 'dtbrfs throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		call({
			'diag': 'invalid'
		});
	}, TypeError );
});

test( 'dtbrfs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		call({
			'N': -1
		});
	}, RangeError );
});

test( 'dtbrfs throws RangeError for negative kd', function t() {
	assert.throws( function throws() {
		call({
			'kd': -1
		});
	}, RangeError );
});

test( 'dtbrfs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		call({
			'nrhs': -1
		});
	}, RangeError );
});

test( 'dtbrfs throws RangeError for too-small LDAB (column-major)', function t() {
	assert.throws( function throws() {
		call({
			'LDAB': 2
		});
	}, RangeError );
});

test( 'dtbrfs throws RangeError for too-small LDAB (row-major)', function t() {
	assert.throws( function throws() {
		call({
			'order': 'row-major',
			'LDAB': 3,
			'LDB': 2,
			'LDX': 2
		});
	}, RangeError );
});

test( 'dtbrfs throws RangeError for too-small LDB (column-major)', function t() {
	assert.throws( function throws() {
		call({
			'LDB': 3
		});
	}, RangeError );
});

test( 'dtbrfs throws RangeError for too-small LDB (row-major)', function t() {
	assert.throws( function throws() {
		call({
			'order': 'row-major',
			'LDAB': 4,
			'LDB': 1,
			'LDX': 2
		});
	}, RangeError );
});

test( 'dtbrfs throws RangeError for too-small LDX (column-major)', function t() {
	assert.throws( function throws() {
		call({
			'LDX': 3
		});
	}, RangeError );
});

test( 'dtbrfs throws RangeError for too-small LDX (row-major)', function t() {
	assert.throws( function throws() {
		call({
			'order': 'row-major',
			'LDAB': 4,
			'LDB': 2,
			'LDX': 1
		});
	}, RangeError );
});

test( 'dtbrfs (column-major, provided workspace) matches ndarray and the fixture', function t() {
	const d = data();
	const FERR1 = new Float64Array( 2 );
	const BERR1 = new Float64Array( 2 );
	const FERR2 = new Float64Array( 2 );
	const BERR2 = new Float64Array( 2 );
	const info1 = dtbrfs( 'column-major', 'upper', 'no-transpose', 'non-unit', 4, 2, 2, new Float64Array( d.AB ), 3, new Float64Array( d.B ), 4, new Float64Array( d.X ), 4, FERR1, 1, BERR1, 1, new Float64Array( 12 ), new Int32Array( 4 ) );
	const info2 = ndarray( 'upper', 'no-transpose', 'non-unit', 4, 2, 2, new Float64Array( d.AB ), 1, 3, 0, new Float64Array( d.B ), 1, 4, 0, new Float64Array( d.X ), 1, 4, 0, FERR2, 1, 0, BERR2, 1, 0, new Float64Array( 12 ), 1, 0, new Int32Array( 4 ), 1, 0 );
	let i;
	assert.strictEqual( info1, 0 );
	assert.strictEqual( info2, 0 );
	for ( i = 0; i < 2; i++ ) {
		assert.strictEqual( FERR1[ i ], FERR2[ i ] );
		assert.strictEqual( BERR1[ i ], BERR2[ i ] );
		assert.strictEqual( BERR1[ i ], multi_rhs.berr[ i ] );
		assert.ok( FERR1[ i ] < 1e-13 );
	}
});

test( 'dtbrfs (column-major, null workspace) matches ndarray', function t() {
	const d = data();
	const FERR1 = new Float64Array( 2 );
	const BERR1 = new Float64Array( 2 );
	const FERR2 = new Float64Array( 2 );
	const BERR2 = new Float64Array( 2 );
	const info1 = dtbrfs( 'column-major', 'upper', 'no-transpose', 'non-unit', 4, 2, 2, new Float64Array( d.AB ), 3, new Float64Array( d.B ), 4, new Float64Array( d.X ), 4, FERR1, 1, BERR1, 1, null, null );
	const info2 = ndarray( 'upper', 'no-transpose', 'non-unit', 4, 2, 2, new Float64Array( d.AB ), 1, 3, 0, new Float64Array( d.B ), 1, 4, 0, new Float64Array( d.X ), 1, 4, 0, FERR2, 1, 0, BERR2, 1, 0, new Float64Array( 12 ), 1, 0, new Int32Array( 4 ), 1, 0 );
	let i;
	assert.strictEqual( info1, info2 );
	for ( i = 0; i < 2; i++ ) {
		assert.strictEqual( FERR1[ i ], FERR2[ i ] );
		assert.strictEqual( BERR1[ i ], BERR2[ i ] );
	}
});

test( 'dtbrfs (row-major, null workspace) matches ndarray and the fixture', function t() {
	const d = data();
	const AB = toRowMajor( d.AB, 3, 4 );
	const B = toRowMajor( d.B, 4, 2 );
	const X = toRowMajor( d.X, 4, 2 );
	const FERR1 = new Float64Array( 2 );
	const BERR1 = new Float64Array( 2 );
	const FERR2 = new Float64Array( 2 );
	const BERR2 = new Float64Array( 2 );
	const info1 = dtbrfs( 'row-major', 'upper', 'no-transpose', 'non-unit', 4, 2, 2, new Float64Array( AB ), 4, new Float64Array( B ), 2, new Float64Array( X ), 2, FERR1, 1, BERR1, 1, null, null );
	const info2 = ndarray( 'upper', 'no-transpose', 'non-unit', 4, 2, 2, new Float64Array( AB ), 4, 1, 0, new Float64Array( B ), 2, 1, 0, new Float64Array( X ), 2, 1, 0, FERR2, 1, 0, BERR2, 1, 0, new Float64Array( 12 ), 1, 0, new Int32Array( 4 ), 1, 0 );
	let i;
	assert.strictEqual( info1, 0 );
	assert.strictEqual( info2, 0 );
	for ( i = 0; i < 2; i++ ) {
		assert.strictEqual( FERR1[ i ], FERR2[ i ] );
		assert.strictEqual( BERR1[ i ], BERR2[ i ] );
		assert.strictEqual( BERR1[ i ], multi_rhs.berr[ i ] );
		assert.ok( FERR1[ i ] < 1e-13 );
	}
});
