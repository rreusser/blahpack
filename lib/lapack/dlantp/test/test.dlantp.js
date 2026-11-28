/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlantp from './../lib/dlantp.js';
import strided from './../lib/strided.js';


// FUNCTIONS //

/**
* Returns a packed 4-by-4 test matrix.
*
* @private
* @returns {Float64Array} packed matrix
*/
function packed() {
	return new Float64Array( [ 1.5, -2.0, 0.25, -1.0, 2.5, -3.5, 0.5, 1.25, -0.75, 3.25 ] );
}


// TESTS //

test( 'dlantp is a function', function t() {
	assert.strictEqual( typeof dlantp, 'function', 'is a function' );
});

test( 'dlantp has expected arity', function t() {
	assert.strictEqual( dlantp.length, 7, 'has expected arity' );
});

test( 'dlantp throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlantp( 'invalid', 'max', 'upper', 'non-unit', 4, packed(), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlantp throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dlantp( 'column-major', 'invalid', 'upper', 'non-unit', 4, packed(), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlantp throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlantp( 'column-major', 'max', 'invalid', 'non-unit', 4, packed(), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlantp throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dlantp( 'column-major', 'max', 'upper', 'invalid', 4, packed(), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlantp throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlantp( 'column-major', 'max', 'upper', 'non-unit', -1, packed(), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dlantp throws TypeError for row-major order (packed storage is column-major only)', function t() {
	assert.throws( function throws() {
		dlantp( 'row-major', 'max', 'upper', 'non-unit', 4, packed(), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlantp (column-major) matches strided for all norms and triangles, with and without WORK', function t() {
	const norms = [ 'max', 'one-norm', 'inf-norm', 'frobenius' ];
	const uplos = [ 'upper', 'lower' ];
	const diags = [ 'non-unit', 'unit' ];
	let expected;
	let actual;
	let i;
	let j;
	let k;
	for ( i = 0; i < norms.length; i++ ) {
		for ( j = 0; j < uplos.length; j++ ) {
			for ( k = 0; k < diags.length; k++ ) {
				expected = strided( norms[ i ], uplos[ j ], diags[ k ], 4, packed(), 1, 0, new Float64Array( 4 ), 1, 0 );
				actual = dlantp( 'column-major', norms[ i ], uplos[ j ], diags[ k ], 4, packed(), new Float64Array( 4 ) );
				assert.strictEqual( actual, expected, norms[ i ] + ' ' + uplos[ j ] + ' ' + diags[ k ] );
				actual = dlantp( 'column-major', norms[ i ], uplos[ j ], diags[ k ], 4, packed(), null );
				assert.strictEqual( actual, expected, norms[ i ] + ' ' + uplos[ j ] + ' ' + diags[ k ] + ' (null WORK)' );
				assert.ok( expected > 0.0, 'nonzero norm' );
			}
		}
	}
});

test( 'dlantp returns 0 for N=0', function t() {
	assert.strictEqual( dlantp( 'column-major', 'max', 'upper', 'non-unit', 0, packed(), null ), 0.0 );
});
