/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhptrf from './../../zhptrf/lib/strided.js';
import zhpcon from './../lib/zhpcon.js';
import strided from './../lib/strided.js';


// FUNCTIONS //

/**
* Returns a factored 3-by-3 Hermitian indefinite matrix in packed storage.
*
* @private
* @param {string} uplo - matrix triangle
* @returns {Object} factored matrix and pivots
*/
function factored( uplo ) {
	let AP;
	if ( uplo === 'upper' ) {
		// (0,0)=1, (0,1)=4+i, (1,1)=-2, (0,2)=3-2i, (1,2)=1+i, (2,2)=5
		AP = new Complex128Array( new Float64Array( [ 1, 0, 4, 1, -2, 0, 3, -2, 1, 1, 5, 0 ] ) ); // eslint-disable-line max-len
	} else {
		// Lower triangle of the same Hermitian matrix:
		AP = new Complex128Array( new Float64Array( [ 1, 0, 4, -1, 3, 2, -2, 0, 1, -1, 5, 0 ] ) ); // eslint-disable-line max-len
	}
	const IPIV = new Int32Array( 3 );
	zhptrf( uplo, 3, AP, 1, 0, IPIV, 1, 0 );
	return {
		'AP': AP,
		'IPIV': IPIV
	};
}


// TESTS //

test( 'zhpcon is a function', function t() {
	assert.strictEqual( typeof zhpcon, 'function', 'is a function' );
});

test( 'zhpcon has expected arity', function t() {
	assert.strictEqual( zhpcon.length, 9, 'has expected arity' );
});

test( 'zhpcon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhpcon( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zhpcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhpcon( 'column-major', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zhpcon throws RangeError for negative anorm', function t() {
	const f = factored( 'upper' );
	assert.throws( function throws() {
		zhpcon( 'column-major', 'upper', 3, f.AP, f.IPIV, 1, -1.0, new Float64Array( 1 ), null ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zhpcon throws TypeError for invalid order', function t() {
	const f = factored( 'upper' );
	assert.throws( function throws() {
		zhpcon( 'invalid', 'upper', 3, f.AP, f.IPIV, 1, 10.0, new Float64Array( 1 ), null ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zhpcon throws TypeError for row-major order (packed storage is column-major only)', function t() {
	const f = factored( 'upper' );
	assert.throws( function throws() {
		zhpcon( 'row-major', 'upper', 3, f.AP, f.IPIV, 1, 10.0, new Float64Array( 1 ), null ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zhpcon (column-major) matches strided, with provided and null WORK', function t() {
	const uplos = [ 'upper', 'lower' ];
	let rcondW;
	let rcondN;
	let rcond0;
	let infoW;
	let infoN;
	let info0;
	let f;
	let i;
	for ( i = 0; i < uplos.length; i++ ) {
		f = factored( uplos[ i ] );
		rcondW = new Float64Array( 1 );
		rcondN = new Float64Array( 1 );
		rcond0 = new Float64Array( 1 );
		infoW = zhpcon( 'column-major', uplos[ i ], 3, f.AP, f.IPIV, 1, 12.0, rcondW, new Complex128Array( 6 ) ); // eslint-disable-line max-len
		infoN = zhpcon( 'column-major', uplos[ i ], 3, f.AP, f.IPIV, 1, 12.0, rcondN, null ); // eslint-disable-line max-len
		info0 = strided( uplos[ i ], 3, f.AP, 1, 0, f.IPIV, 1, 0, 12.0, rcond0, new Complex128Array( 6 ), 1, 0 ); // eslint-disable-line max-len
		assert.strictEqual( info0, 0, uplos[ i ] + ': strided info' );
		assert.strictEqual( infoW, info0, uplos[ i ] + ': info (WORK)' );
		assert.strictEqual( infoN, info0, uplos[ i ] + ': info (null WORK)' );
		assert.ok( rcond0[ 0 ] > 0.0 && rcond0[ 0 ] <= 1.0, uplos[ i ] + ': rcond in (0,1]' ); // eslint-disable-line max-len
		assert.strictEqual( rcondW[ 0 ], rcond0[ 0 ], uplos[ i ] + ': rcond (WORK)' ); // eslint-disable-line max-len
		assert.strictEqual( rcondN[ 0 ], rcond0[ 0 ], uplos[ i ] + ': rcond (null WORK)' ); // eslint-disable-line max-len
	}
});
