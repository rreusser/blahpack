/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dtpcon from './../lib/dtpcon.js';
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'dtpcon is a function', function t() {
	assert.strictEqual( typeof dtpcon, 'function', 'is a function' );
});

test( 'dtpcon has expected arity', function t() {
	assert.strictEqual( dtpcon.length, 9, 'has expected arity' );
});

test( 'dtpcon throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dtpcon( 'column-major', 'invalid', 'upper', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtpcon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtpcon( 'column-major', 'one-norm', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtpcon throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dtpcon( 'column-major', 'one-norm', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtpcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtpcon( 'column-major', 'one-norm', 'upper', 'non-unit', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dtpcon throws TypeError for row-major order (packed storage is column-major only)', function t() {
	assert.throws( function throws() {
		dtpcon( 'row-major', 'one-norm', 'upper', 'non-unit', 2, new Float64Array( [ 2.0, 1.0, 3.0 ] ), new Float64Array( 1 ), new Float64Array( 6 ), new Int32Array( 2 ) );
	}, TypeError );
});

test( 'dtpcon matches ndarray (column-major, WORK and IWORK = null)', function t() {
	// 3x3 triangular matrices in packed storage (upper: columns of [[4,1,-2],[0,3,0.5],[0,0,5]]; lower: its transpose):
	const packed = {
		'upper': [ 4.0, 1.0, 3.0, -2.0, 0.5, 5.0 ],
		'lower': [ 4.0, 1.0, -2.0, 3.0, 0.5, 5.0 ]
	};
	[ 'one-norm', 'inf-norm' ].forEach( function eachNorm( norm ) {
		[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
			[ 'non-unit', 'unit' ].forEach( function eachDiag( diag ) {
				const label = norm + '/' + uplo + '/' + diag;
				const AP = new Float64Array( packed[ uplo ] );
				const r1 = new Float64Array( 1 );
				const r2 = new Float64Array( 1 );
				const info1 = dtpcon( 'column-major', norm, uplo, diag, 3, AP, r1, null, null );
				const info2 = ndarray( norm, uplo, diag, 3, AP, 1, 0, r2, new Float64Array( 9 ), 1, 0, new Int32Array( 3 ), 1, 0 );
				assert.strictEqual( info1, 0, label + ' info' );
				assert.strictEqual( info2, 0, label + ' info (ndarray)' );
				assert.strictEqual( r1[ 0 ], r2[ 0 ], label + ' rcond' );
				assert.ok( r1[ 0 ] > 0.0 && r1[ 0 ] <= 1.0, label + ' rcond in (0,1]' );
			});
		});
	});
});
