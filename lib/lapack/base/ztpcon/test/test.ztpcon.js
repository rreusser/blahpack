/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ztpcon from './../lib/ztpcon.js';
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'ztpcon is a function', function t() {
	assert.strictEqual( typeof ztpcon, 'function', 'is a function' );
});

test( 'ztpcon has expected arity', function t() {
	assert.strictEqual( ztpcon.length, 9, 'has expected arity' );
});

test( 'ztpcon throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		ztpcon( 'column-major', 'invalid', 'upper', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztpcon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztpcon( 'column-major', 'one-norm', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztpcon throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		ztpcon( 'column-major', 'one-norm', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztpcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztpcon( 'column-major', 'one-norm', 'upper', 'non-unit', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'ztpcon throws TypeError for row-major order (packed storage is column-major only)', function t() {
	assert.throws( function throws() {
		ztpcon( 'row-major', 'one-norm', 'upper', 'non-unit', 2, new Complex128Array( [ 2.0, 0.0, 1.0, 1.0, 3.0, -1.0 ] ), new Float64Array( 1 ), new Complex128Array( 4 ), new Float64Array( 2 ) );
	}, TypeError );
});

test( 'ztpcon matches ndarray (column-major, WORK and RWORK = null)', function t() {
	// 3x3 complex triangular matrices in packed storage (interleaved re/im):
	const packed = {
		'upper': [ 4.0, 1.0, 1.0, -1.0, 3.0, 0.5, -2.0, 0.0, 0.5, 2.0, 5.0, -1.0 ],
		'lower': [ 4.0, 1.0, 1.0, -1.0, -2.0, 0.0, 3.0, 0.5, 0.5, 2.0, 5.0, -1.0 ]
	};
	[ 'one-norm', 'inf-norm' ].forEach( function eachNorm( norm ) {
		[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
			[ 'non-unit', 'unit' ].forEach( function eachDiag( diag ) {
				const label = norm + '/' + uplo + '/' + diag;
				const AP = new Complex128Array( packed[ uplo ] );
				const r1 = new Float64Array( 1 );
				const r2 = new Float64Array( 1 );
				const info1 = ztpcon( 'column-major', norm, uplo, diag, 3, AP, r1, null, null );
				const info2 = ndarray( norm, uplo, diag, 3, AP, 1, 0, r2, new Complex128Array( 6 ), 1, 0, new Float64Array( 3 ), 1, 0 );
				assert.strictEqual( info1, 0, label + ' info' );
				assert.strictEqual( info2, 0, label + ' info (ndarray)' );
				assert.strictEqual( r1[ 0 ], r2[ 0 ], label + ' rcond' );
				assert.ok( r1[ 0 ] > 0.0 && r1[ 0 ] <= 1.0, label + ' rcond in (0,1]' );
			});
		});
	});
});
