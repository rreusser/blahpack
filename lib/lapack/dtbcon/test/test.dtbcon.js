/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dtbcon from './../lib/dtbcon.js';
import ndarray from './../lib/ndarray.js';
import upperNonunitOnenorm from './fixtures/upper_nonunit_onenorm.json' with { type: 'json' };
import upperNonunitInfnorm from './fixtures/upper_nonunit_infnorm.json' with { type: 'json' };


// VARIABLES //

// Upper band (KD=2, N=4) from test/fortran/test_dtbcon.f90: BAND[ r ][ c ] is band row r (row KD = diagonal), column c.
const BAND = [
	[ 0.0, 0.0, 2.0, 1.0 ],
	[ 0.0, -1.0, -2.0, -3.0 ],
	[ 10.0, 8.0, 12.0, 6.0 ]
];


// FUNCTIONS //

/**
* Stores the band in the given layout with the given leading dimension.
*
* @private
* @param {string} order - layout
* @param {PositiveInteger} LDAB - leading dimension
* @returns {Float64Array} band storage
*/
function bandStorage( order, LDAB ) {
	let r;
	let c;
	const out = new Float64Array( ( order === 'column-major' ) ? LDAB * 4 : LDAB * 3 );
	for ( r = 0; r < 3; r++ ) {
		for ( c = 0; c < 4; c++ ) {
			if ( order === 'column-major' ) {
				out[ r + ( c * LDAB ) ] = BAND[ r ][ c ];
			} else {
				out[ ( r * LDAB ) + c ] = BAND[ r ][ c ];
			}
		}
	}
	return out;
}

/**
* Checks that the layout wrapper matches the ndarray interface and the Fortran fixture.
*
* @private
* @param {string} order - layout
* @param {string} norm - norm
* @param {PositiveInteger} LDAB - leading dimension
* @param {boolean} nullWork - whether to pass `null` workspaces
* @param {Object} tc - fixture
*/
function compareWithNdarray( order, norm, LDAB, nullWork, tc ) {
	const AB = bandStorage( order, LDAB );
	const rc1 = new Float64Array( 1 );
	const rc2 = new Float64Array( 1 );
	const sab1 = ( order === 'column-major' ) ? 1 : LDAB;
	const sab2 = ( order === 'column-major' ) ? LDAB : 1;
	const info1 = dtbcon( order, norm, 'upper', 'non-unit', 4, 2, AB, LDAB, rc1, ( nullWork ) ? null : new Float64Array( 12 ), ( nullWork ) ? null : new Int32Array( 4 ) );
	const info2 = ndarray( norm, 'upper', 'non-unit', 4, 2, bandStorage( order, LDAB ), sab1, sab2, 0, rc2, new Float64Array( 12 ), 1, 0, new Int32Array( 4 ), 1, 0 );
	assert.strictEqual( info1, tc.info, 'info' );
	assert.strictEqual( info2, tc.info, 'info (ndarray)' );
	assert.strictEqual( rc1[ 0 ], rc2[ 0 ], 'rcond matches ndarray' );
	assert.ok( Math.abs( rc1[ 0 ] - tc.rcond ) <= 1e-14 * tc.rcond, 'rcond matches fixture: ' + rc1[ 0 ] + ' vs ' + tc.rcond );
}


// TESTS //

test( 'dtbcon is a function', function t() {
	assert.strictEqual( typeof dtbcon, 'function', 'is a function' );
});

test( 'dtbcon has expected arity', function t() {
	assert.strictEqual( dtbcon.length, 11, 'has expected arity' );
});

test( 'dtbcon throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dtbcon( 'column-major', 'invalid', 'upper', 'non-unit', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtbcon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtbcon( 'column-major', 'one-norm', 'invalid', 'non-unit', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtbcon throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dtbcon( 'column-major', 'one-norm', 'upper', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtbcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtbcon( 'column-major', 'one-norm', 'upper', 'non-unit', -1, 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dtbcon matches ndarray and fixture (column-major, one-norm, null workspaces)', function t() {
	compareWithNdarray( 'column-major', 'one-norm', 3, true, upperNonunitOnenorm );
});

test( 'dtbcon matches ndarray and fixture (column-major, inf-norm, LDAB > KD+1, provided workspaces)', function t() {
	compareWithNdarray( 'column-major', 'inf-norm', 5, false, upperNonunitInfnorm );
});

test( 'dtbcon matches ndarray and fixture (row-major, one-norm, provided workspaces)', function t() {
	compareWithNdarray( 'row-major', 'one-norm', 4, false, upperNonunitOnenorm );
});

test( 'dtbcon matches ndarray and fixture (row-major, inf-norm, LDAB > N, null workspaces)', function t() {
	compareWithNdarray( 'row-major', 'inf-norm', 6, true, upperNonunitInfnorm );
});

test( 'dtbcon throws RangeError for row-major LDAB < N', function t() {
	assert.throws( function throws() {
		dtbcon( 'row-major', 'one-norm', 'upper', 'non-unit', 4, 2, bandStorage( 'row-major', 4 ), 3, new Float64Array( 1 ), null, null );
	}, RangeError );
});

test( 'dtbcon throws RangeError for column-major LDAB < KD+1', function t() {
	assert.throws( function throws() {
		dtbcon( 'column-major', 'one-norm', 'upper', 'non-unit', 4, 2, bandStorage( 'column-major', 3 ), 2, new Float64Array( 1 ), null, null );
	}, RangeError );
});

test( 'dtbcon throws RangeError for undersized workspaces', function t() {
	assert.throws( function throws() {
		dtbcon( 'column-major', 'one-norm', 'upper', 'non-unit', 4, 2, bandStorage( 'column-major', 3 ), 3, new Float64Array( 1 ), new Float64Array( 11 ), new Int32Array( 4 ) );
	}, RangeError );
	assert.throws( function throws() {
		dtbcon( 'column-major', 'one-norm', 'upper', 'non-unit', 4, 2, bandStorage( 'column-major', 3 ), 3, new Float64Array( 1 ), new Float64Array( 12 ), new Int32Array( 3 ) );
	}, RangeError );
});
