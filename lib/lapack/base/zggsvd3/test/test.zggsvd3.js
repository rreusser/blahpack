/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zggsvd3 from './../lib/zggsvd3.js';


// FIXTURES //

/**
* Returns a dummy argument bundle for invoking `zggsvd3` in throws-style tests.
*
* @private
* @returns {Object} argument bundle with pre-allocated typed arrays
*/
function dummyArgs() {
	return {
		'A': new Complex128Array( 9 ),
		'B': new Complex128Array( 6 ),
		'ALPHA': new Float64Array( 3 ),
		'BETA': new Float64Array( 3 ),
		'U': new Complex128Array( 9 ),
		'V': new Complex128Array( 4 ),
		'Q': new Complex128Array( 9 ),
		'WORK': new Complex128Array( 500 ),
		'RWORK': new Float64Array( 12 ),
		'IWORK': new Int32Array( 3 ),
		'K': new Int32Array( 1 ),
		'L': new Int32Array( 1 )
	};
}


// TESTS //

test( 'zggsvd3 is a function', function t() {
	assert.strictEqual( typeof zggsvd3, 'function', 'is a function' );
});

test( 'zggsvd3 throws TypeError for invalid jobu', function t() {
	var d = dummyArgs();
	assert.throws( function throws() {
		zggsvd3( 'invalid', 'compute-V', 'compute-Q', 3, 3, 2, d.K, d.L, d.A, 3, d.B, 2, d.ALPHA, 1, d.BETA, 1, d.U, 3, d.V, 2, d.Q, 3, d.WORK, 1, 500, d.RWORK, 1, d.IWORK, 1 );
	}, TypeError );
});

test( 'zggsvd3 throws TypeError for invalid jobv', function t() {
	var d = dummyArgs();
	assert.throws( function throws() {
		zggsvd3( 'compute-U', 'invalid', 'compute-Q', 3, 3, 2, d.K, d.L, d.A, 3, d.B, 2, d.ALPHA, 1, d.BETA, 1, d.U, 3, d.V, 2, d.Q, 3, d.WORK, 1, 500, d.RWORK, 1, d.IWORK, 1 );
	}, TypeError );
});

test( 'zggsvd3 throws TypeError for invalid jobq', function t() {
	var d = dummyArgs();
	assert.throws( function throws() {
		zggsvd3( 'compute-U', 'compute-V', 'invalid', 3, 3, 2, d.K, d.L, d.A, 3, d.B, 2, d.ALPHA, 1, d.BETA, 1, d.U, 3, d.V, 2, d.Q, 3, d.WORK, 1, 500, d.RWORK, 1, d.IWORK, 1 );
	}, TypeError );
});

test( 'zggsvd3 throws RangeError for negative M', function t() {
	var d = dummyArgs();
	assert.throws( function throws() {
		zggsvd3( 'compute-U', 'compute-V', 'compute-Q', -1, 3, 2, d.K, d.L, d.A, 3, d.B, 2, d.ALPHA, 1, d.BETA, 1, d.U, 3, d.V, 2, d.Q, 3, d.WORK, 1, 500, d.RWORK, 1, d.IWORK, 1 );
	}, RangeError );
});

test( 'zggsvd3 throws RangeError for negative N', function t() {
	var d = dummyArgs();
	assert.throws( function throws() {
		zggsvd3( 'compute-U', 'compute-V', 'compute-Q', 3, -1, 2, d.K, d.L, d.A, 3, d.B, 2, d.ALPHA, 1, d.BETA, 1, d.U, 3, d.V, 2, d.Q, 3, d.WORK, 1, 500, d.RWORK, 1, d.IWORK, 1 );
	}, RangeError );
});

test( 'zggsvd3 throws RangeError for negative P', function t() {
	var d = dummyArgs();
	assert.throws( function throws() {
		zggsvd3( 'compute-U', 'compute-V', 'compute-Q', 3, 3, -1, d.K, d.L, d.A, 3, d.B, 2, d.ALPHA, 1, d.BETA, 1, d.U, 3, d.V, 2, d.Q, 3, d.WORK, 1, 500, d.RWORK, 1, d.IWORK, 1 );
	}, RangeError );
});

test( 'zggsvd3 throws RangeError for LDA < M', function t() {
	var d = dummyArgs();
	assert.throws( function throws() {
		zggsvd3( 'compute-U', 'compute-V', 'compute-Q', 3, 3, 2, d.K, d.L, d.A, 1, d.B, 2, d.ALPHA, 1, d.BETA, 1, d.U, 3, d.V, 2, d.Q, 3, d.WORK, 1, 500, d.RWORK, 1, d.IWORK, 1 );
	}, RangeError );
});

test( 'zggsvd3 throws RangeError for LDB < P', function t() {
	var d = dummyArgs();
	assert.throws( function throws() {
		zggsvd3( 'compute-U', 'compute-V', 'compute-Q', 3, 3, 2, d.K, d.L, d.A, 3, d.B, 1, d.ALPHA, 1, d.BETA, 1, d.U, 3, d.V, 2, d.Q, 3, d.WORK, 1, 500, d.RWORK, 1, d.IWORK, 1 );
	}, RangeError );
});

test( 'zggsvd3 computes GSVD for basic 3x3 / 2x3 case', function t() {
	var info;
	var d;

	d = dummyArgs();

	// A is 3x3, B is 2x3 (column-major):
	d.A.set( [ 1.0, 0.5 ], 0 );
	d.A.set( [ 4.0, 0.0 ], 1 );
	d.A.set( [ 7.0, -0.5 ], 2 );
	d.A.set( [ 2.0, 0.0 ], 3 );
	d.A.set( [ 5.0, 1.0 ], 4 );
	d.A.set( [ 8.0, 0.0 ], 5 );
	d.A.set( [ 3.0, -0.5 ], 6 );
	d.A.set( [ 6.0, 0.0 ], 7 );
	d.A.set( [ 10.0, 0.5 ], 8 );
	d.B.set( [ 1.0, 0.0 ], 0 );
	d.B.set( [ 0.0, 0.0 ], 1 );
	d.B.set( [ 0.0, 0.0 ], 2 );
	d.B.set( [ 1.0, 0.0 ], 3 );
	d.B.set( [ 1.0, 0.5 ], 4 );
	d.B.set( [ 1.0, -0.5 ], 5 );
	info = zggsvd3( 'compute-U', 'compute-V', 'compute-Q', 3, 3, 2, d.K, d.L, d.A, 3, d.B, 2, d.ALPHA, 1, d.BETA, 1, d.U, 3, d.V, 2, d.Q, 3, d.WORK, 1, 500, d.RWORK, 1, d.IWORK, 1 );
	assert.strictEqual( info, 0, 'info = 0' );
	assert.strictEqual( d.K[ 0 ] + d.L[ 0 ], 3, 'K+L equals N' );
});
