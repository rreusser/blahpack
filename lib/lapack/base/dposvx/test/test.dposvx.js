/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dposvx from './../lib/dposvx.js';
import ndarray from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Returns a fresh set of arguments for a 3x3 SPD system with two right-hand sides (column-major).
*
* @private
* @returns {Object} arguments
*/
function system() {
	return {
		'A': new Float64Array( [ 4.0, 2.0, 0.0, 2.0, 5.0, 1.0, 0.0, 1.0, 3.0 ] ),
		'AF': new Float64Array( 9 ),
		'B': new Float64Array( [ 6.0, 8.0, 4.0, 2.0, -1.0, 5.0 ] ),
		'X': new Float64Array( 6 ),
		's': new Float64Array( 3 ),
		'rcond': new Float64Array( 1 ),
		'FERR': new Float64Array( 2 ),
		'BERR': new Float64Array( 2 )
	};
}

/**
* Calls the strided wrapper with valid arguments, overriding selected ones.
*
* @private
* @param {Object} o - overrides
* @returns {Object} result
*/
function call( o ) {
	const a = system();
	const v = Object.assign( {
		'order': 'column-major',
		'fact': 'not-factored',
		'uplo': 'upper',
		'N': 3,
		'nrhs': 2,
		'LDA': 3,
		'equed': 'none'
	}, o );
	return dposvx( v.order, v.fact, v.uplo, v.N, v.nrhs, a.A, v.LDA, a.AF, 3, v.equed, a.s, 1, a.B, 3, a.X, 3, a.rcond, a.FERR, 1, a.BERR, 1, null, null ); // eslint-disable-line max-len
}


// TESTS //

test( 'dposvx is a function', function t() {
	assert.strictEqual( typeof dposvx, 'function', 'is a function' );
});

test( 'dposvx has expected arity', function t() {
	assert.strictEqual( dposvx.length, 23, 'has expected arity' );
});

test( 'dposvx throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		call( { 'order': 'invalid' } );
	}, TypeError );
});

test( 'dposvx throws TypeError for invalid fact', function t() {
	assert.throws( function throws() {
		call( { 'fact': 'invalid' } );
	}, TypeError );
});

test( 'dposvx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		call( { 'uplo': 'invalid' } );
	}, TypeError );
});

test( 'dposvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		call( { 'N': -1 } );
	}, RangeError );
});

test( 'dposvx throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		call( { 'nrhs': -1 } );
	}, RangeError );
});

test( 'dposvx throws RangeError for too-small LDA', function t() {
	assert.throws( function throws() {
		call( { 'LDA': 2 } );
	}, RangeError );
});

test( 'dposvx throws TypeError for invalid equed when fact is factored', function t() {
	assert.throws( function throws() {
		call( { 'fact': 'factored', 'equed': 'invalid' } );
	}, TypeError );
});

test( 'dposvx (column-major) writes rcond into the provided array and matches ndarray', function t() {
	const a = system();
	const b = system();
	const r1 = dposvx( 'column-major', 'not-factored', 'upper', 3, 2, a.A, 3, a.AF, 3, 'none', a.s, 1, a.B, 3, a.X, 3, a.rcond, a.FERR, 1, a.BERR, 1, null, null ); // eslint-disable-line max-len
	const r2 = ndarray( 'not-factored', 'upper', 3, 2, b.A, 1, 3, 0, b.AF, 1, 3, 0, 'none', b.s, 1, 0, b.B, 1, 3, 0, b.X, 1, 3, 0, b.rcond, b.FERR, 1, 0, b.BERR, 1, 0, new Float64Array( 9 ), 1, 0, new Int32Array( 3 ), 1, 0 ); // eslint-disable-line max-len
	assert.deepStrictEqual( r1, r2 );
	assert.strictEqual( r1.info, 0 );
	assert.strictEqual( a.rcond[ 0 ], r1.rcond );
	assert.ok( a.rcond[ 0 ] > 0.0 );
	assert.deepStrictEqual( a.rcond, b.rcond );
	assert.deepStrictEqual( a.X, b.X );
	assert.deepStrictEqual( a.AF, b.AF );
	assert.deepStrictEqual( a.FERR, b.FERR );
	assert.deepStrictEqual( a.BERR, b.BERR );
});

test( 'dposvx (row-major) matches column-major on the transposed layout', function t() {
	const a = system();
	const b = system();

	// A is symmetric, so its row-major storage is identical; transpose B (3x2):
	const Brm = new Float64Array( [ 6.0, 2.0, 8.0, -1.0, 4.0, 5.0 ] );
	const Xrm = new Float64Array( 6 );
	let i;
	dposvx( 'column-major', 'not-factored', 'upper', 3, 2, a.A, 3, a.AF, 3, 'none', a.s, 1, a.B, 3, a.X, 3, a.rcond, a.FERR, 1, a.BERR, 1, null, null ); // eslint-disable-line max-len
	dposvx( 'row-major', 'not-factored', 'lower', 3, 2, b.A, 3, b.AF, 3, 'none', b.s, 1, Brm, 2, Xrm, 2, b.rcond, b.FERR, 1, b.BERR, 1, null, null ); // eslint-disable-line max-len
	assert.strictEqual( a.rcond[ 0 ], b.rcond[ 0 ] );
	for ( i = 0; i < 3; i++ ) {
		assert.strictEqual( Xrm[ ( i * 2 ) ], a.X[ i ] );
		assert.strictEqual( Xrm[ ( i * 2 ) + 1 ], a.X[ 3 + i ] );
	}
});
