/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ztbrfs from './../lib/ztbrfs.js';
import ndarray from './../lib/ndarray.js';
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };


// FIXTURES //

// Diagonal (kd=0) triangular identity band, AB is 1xN (LDAB=1):
function diagAB() {
	return new Complex128Array([ 1.0, 0.0, 1.0, 0.0 ]);
}


// Multi-RHS data (upper, kd=1, N=3, nrhs=2), column-major interleaved re/im:
const MR_AB = [ 0, 0, 3, 0, 1, 1, 4, 1, 2, -1, 5, -1 ];
const MR_B = [ 4, 1, 6, 0, 5, -1, 8, 3, 6.5, -2.5, 3, 2 ];
const MR_X = multi_rhs.x1.concat( multi_rhs.x2 );

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
* Runs the wrapper and the ndarray API on the multi-RHS data and compares outputs.
*
* @private
* @param {string} order - layout
* @param {boolean} nullWork - whether to pass null workspace to the wrapper
*/
function compareMultiRHS( order, nullWork ) {
	const rm = ( order === 'row-major' );
	const AB = ( rm ) ? toRowMajor( MR_AB, 2, 3 ) : new Float64Array( MR_AB );
	const B = ( rm ) ? toRowMajor( MR_B, 3, 2 ) : new Float64Array( MR_B );
	const X = ( rm ) ? toRowMajor( MR_X, 3, 2 ) : new Float64Array( MR_X );
	const LDAB = ( rm ) ? 3 : 2;
	const LDB = ( rm ) ? 2 : 3;
	const X1 = new Complex128Array( X );
	const X2 = new Complex128Array( X );
	const F1 = new Float64Array( 2 );
	const F2 = new Float64Array( 2 );
	const E1 = new Float64Array( 2 );
	const E2 = new Float64Array( 2 );
	const W = ( nullWork ) ? null : new Complex128Array( 6 );
	const RW = ( nullWork ) ? null : new Float64Array( 3 );
	const info1 = ztbrfs( order, 'upper', 'no-transpose', 'non-unit', 3, 1, 2, new Complex128Array( AB ), LDAB, new Complex128Array( B ), LDB, X1, LDB, F1, 1, E1, 1, W, RW );
	const info2 = ndarray( 'upper', 'no-transpose', 'non-unit', 3, 1, 2, new Complex128Array( AB ), ( rm ) ? LDAB : 1, ( rm ) ? 1 : LDAB, 0, new Complex128Array( B ), ( rm ) ? LDB : 1, ( rm ) ? 1 : LDB, 0, X2, ( rm ) ? LDB : 1, ( rm ) ? 1 : LDB, 0, F2, 1, 0, E2, 1, 0, new Complex128Array( 6 ), 1, 0, new Float64Array( 3 ), 1, 0 );
	assert.strictEqual( info1, 0 );
	assert.strictEqual( info2, 0 );
	assertSame( new Float64Array( X1.buffer ), new Float64Array( X2.buffer ), 'X' );
	assertSame( F1, F2, 'FERR' );
	assertSame( E1, E2, 'BERR' );
	assert.ok( Math.abs( E1[ 0 ] - multi_rhs.berr[ 0 ] ) < 1e-12, 'BERR[0] matches fixture' );
	assert.ok( Math.abs( E1[ 1 ] - multi_rhs.berr[ 1 ] ) < 1e-12, 'BERR[1] matches fixture' );
	assert.ok( F1[ 0 ] < 1e-12 && F1[ 1 ] < 1e-12, 'FERR is tiny' );
}

/**
* Calls the wrapper with valid multi-RHS arguments, overriding selected ones.
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
		'LDB': 3,
		'LDX': 3
	};
	let k;
	for ( k in o ) {
		if ( Object.prototype.hasOwnProperty.call( o, k ) ) {
			a[ k ] = o[ k ];
		}
	}
	return ztbrfs( a.order, a.uplo, a.trans, a.diag, a.N, a.kd, a.nrhs, new Complex128Array( MR_AB ), a.LDAB, new Complex128Array( MR_B ), a.LDB, new Complex128Array( MR_X ), a.LDX, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, null, null );
}


// TESTS //

test( 'ztbrfs is a function', function t() {
	assert.strictEqual( typeof ztbrfs, 'function', 'is a function' );
});

test( 'ztbrfs has expected arity', function t() {
	assert.strictEqual( ztbrfs.length, 19, 'has expected arity' );
});

test( 'ztbrfs throws a TypeError for an invalid uplo', function t() {
	assert.throws( function throws() {
		ztbrfs( 'column-major', 'bogus', 'no-transpose', 'non-unit', 2, 0, 1, diagAB(), 1, new Complex128Array( 2 ), 2, new Complex128Array( 2 ), 2, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, null, null );
	}, TypeError );
});

test( 'ztbrfs throws a RangeError for LDAB < kd+1', function t() {
	assert.throws( function throws() {
		ztbrfs( 'column-major', 'upper', 'no-transpose', 'non-unit', 2, 2, 1, diagAB(), 2, new Complex128Array( 2 ), 2, new Complex128Array( 2 ), 2, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, null, null );
	}, RangeError );
});

test( 'ztbrfs refines the exact solution of I*x=b (X unchanged, tiny errors)', function t() {
	const X = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const BERR = new Float64Array( 1 );
	const info = ztbrfs( 'column-major', 'upper', 'no-transpose', 'non-unit', 2, 0, 1, diagAB(), 1, new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]), 2, X, 2, new Float64Array( 1 ), 1, BERR, 1, null, null );
	assert.strictEqual( info, 0, 'info is 0' );

	const view = new Float64Array( X.buffer );
	assert.ok( Math.abs( view[ 0 ] - 3.0 ) < 1e-12 && Math.abs( view[ 2 ] - 5.0 ) < 1e-12, 'X unchanged' );
	assert.ok( BERR[ 0 ] < 1e-12, 'backward error is tiny' );
});

test( 'ztbrfs matches the ndarray form', function t() {
	const X1 = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const Bk1 = new Float64Array( 1 );
	const info1 = ztbrfs( 'column-major', 'upper', 'no-transpose', 'non-unit', 2, 0, 1, diagAB(), 1, new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]), 2, X1, 2, new Float64Array( 1 ), 1, Bk1, 1, null, null );

	const X2 = new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]);
	const Bk2 = new Float64Array( 1 );
	const WORK = new Complex128Array( 4 );
	const RWORK = new Float64Array( 2 );
	const info2 = ndarray( 'upper', 'no-transpose', 'non-unit', 2, 0, 1, diagAB(), 1, 1, 0, new Complex128Array([ 3.0, -1.0, 5.0, 2.0 ]), 1, 2, 0, X2, 1, 2, 0, new Float64Array( 1 ), 1, 0, Bk2, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	assert.strictEqual( info1, info2, 'info matches' );
	assert.ok( Math.abs( Bk1[ 0 ] - Bk2[ 0 ] ) < 1e-14, 'BERR matches' );
	const v1 = new Float64Array( X1.buffer );
	const v2 = new Float64Array( X2.buffer );
	for ( let i = 0; i < v1.length; i++ ) {
		assert.ok( Math.abs( v1[ i ] - v2[ i ] ) < 1e-14, 'X['+i+'] matches' );
	}
});

test( 'ztbrfs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		call({ 'order': 'invalid' });
	}, TypeError );
});

test( 'ztbrfs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		call({ 'trans': 'invalid' });
	}, TypeError );
});

test( 'ztbrfs throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		call({ 'diag': 'invalid' });
	}, TypeError );
});

test( 'ztbrfs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		call({ 'N': -1 });
	}, RangeError );
});

test( 'ztbrfs throws RangeError for negative kd', function t() {
	assert.throws( function throws() {
		call({ 'kd': -1 });
	}, RangeError );
});

test( 'ztbrfs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		call({ 'nrhs': -1 });
	}, RangeError );
});

test( 'ztbrfs throws RangeError for too-small LDAB (row-major)', function t() {
	assert.throws( function throws() {
		call({ 'order': 'row-major', 'LDAB': 2, 'LDB': 2, 'LDX': 2 });
	}, RangeError );
});

test( 'ztbrfs throws RangeError for too-small LDB (column-major)', function t() {
	assert.throws( function throws() {
		call({ 'LDB': 2 });
	}, RangeError );
});

test( 'ztbrfs throws RangeError for too-small LDB (row-major)', function t() {
	assert.throws( function throws() {
		call({ 'order': 'row-major', 'LDAB': 3, 'LDB': 1, 'LDX': 2 });
	}, RangeError );
});

test( 'ztbrfs throws RangeError for too-small LDX (column-major)', function t() {
	assert.throws( function throws() {
		call({ 'LDX': 2 });
	}, RangeError );
});

test( 'ztbrfs throws RangeError for too-small LDX (row-major)', function t() {
	assert.throws( function throws() {
		call({ 'order': 'row-major', 'LDAB': 3, 'LDB': 2, 'LDX': 1 });
	}, RangeError );
});

test( 'ztbrfs (column-major, provided workspace) matches ndarray and the fixture', function t() {
	compareMultiRHS( 'column-major', false );
});

test( 'ztbrfs (column-major, null workspace) matches ndarray and the fixture', function t() {
	compareMultiRHS( 'column-major', true );
});

test( 'ztbrfs (row-major, provided workspace) matches ndarray and the fixture', function t() {
	compareMultiRHS( 'row-major', false );
});

test( 'ztbrfs (row-major, null workspace) matches ndarray and the fixture', function t() {
	compareMultiRHS( 'row-major', true );
});
