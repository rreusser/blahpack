/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlantp from './../lib/zlantp.js';
import ndarray from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Returns a packed 4-by-4 test matrix.
*
* @private
* @returns {Complex128Array} packed matrix
*/
function packed() {
	return new Complex128Array( [ 1.5, -0.5, -2.0, 3.0, 0.25, 4.0, -1.0, -1.5, 2.5, 0.75, -3.5, 1.0, 0.5, -2.25, 1.25, 0.0, -0.75, 2.0, 3.25, -1.25 ] );
}


// TESTS //

test( 'zlantp is a function', function t() {
	assert.strictEqual( typeof zlantp, 'function', 'is a function' );
});

test( 'zlantp has expected arity', function t() {
	assert.strictEqual( zlantp.length, 7, 'has expected arity' );
});

test( 'zlantp throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlantp( 'invalid', 'max', 'upper', 'non-unit', 4, packed(), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlantp throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlantp( 'column-major', 'invalid', 'upper', 'non-unit', 4, packed(), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlantp throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlantp( 'column-major', 'max', 'invalid', 'non-unit', 4, packed(), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlantp throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		zlantp( 'column-major', 'max', 'upper', 'invalid', 4, packed(), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlantp throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlantp( 'column-major', 'max', 'upper', 'non-unit', -1, packed(), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zlantp throws TypeError for row-major order (packed storage is column-major only)', function t() {
	assert.throws( function throws() {
		zlantp( 'row-major', 'max', 'upper', 'non-unit', 4, packed(), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlantp (column-major) matches ndarray for all norms and triangles, with and without WORK', function t() {
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
				expected = ndarray( norms[ i ], uplos[ j ], diags[ k ], 4, packed(), 1, 0, new Float64Array( 4 ), 1, 0 );
				actual = zlantp( 'column-major', norms[ i ], uplos[ j ], diags[ k ], 4, packed(), new Float64Array( 4 ) );
				assert.strictEqual( actual, expected, norms[ i ] + ' ' + uplos[ j ] + ' ' + diags[ k ] );
				actual = zlantp( 'column-major', norms[ i ], uplos[ j ], diags[ k ], 4, packed(), null );
				assert.strictEqual( actual, expected, norms[ i ] + ' ' + uplos[ j ] + ' ' + diags[ k ] + ' (null WORK)' );
				assert.ok( expected > 0.0, 'nonzero norm' );
			}
		}
	}
});

test( 'zlantp returns 0 for N=0', function t() {
	assert.strictEqual( zlantp( 'column-major', 'max', 'upper', 'non-unit', 0, packed(), null ), 0.0 );
});
