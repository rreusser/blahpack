/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dpotrf from './../../dpotrf/lib/dpotrf.js';
import dpotrs from './../../dpotrs/lib/dpotrs.js';
import dporfs from './../lib/dporfs.js';


// TESTS //

test( 'dporfs is a function', function t() {
	assert.strictEqual( typeof dporfs, 'function', 'is a function' );
});

test( 'dporfs has expected arity', function t() {
	assert.strictEqual( dporfs.length, 19, 'has expected arity' );
});

test( 'dporfs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dporfs( 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dporfs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dporfs( 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dporfs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dporfs( 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dporfs allocates workspace when `WORK` and `IWORK` are null', function t() {
	const A = new Float64Array( [ 4.0, 1.0, 0.0, 1.0, 3.0, 1.0, 0.0, 1.0, 2.0 ] );
	const AF = new Float64Array( A );
	const B = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	dpotrf( 'column-major', 'upper', 3, AF, 3 );
	const X1 = new Float64Array( B );
	dpotrs( 'column-major', 'upper', 3, 1, AF, 3, X1, 3 );
	const X2 = new Float64Array( X1 );
	const F1 = new Float64Array( 1 );
	const R1 = new Float64Array( 1 );
	const F2 = new Float64Array( 1 );
	const R2 = new Float64Array( 1 );
	dporfs( 'upper', 3, 1, A, 3, AF, 3, B, 3, X1, 3, F1, 1, R1, 1, null, 1, null, 1 );
	dporfs( 'upper', 3, 1, A, 3, AF, 3, B, 3, X2, 3, F2, 1, R2, 1, new Float64Array( 9 ), 1, new Int32Array( 3 ), 1 );
	assert.deepStrictEqual( X1, X2 );
	assert.deepStrictEqual( F1, F2 );
	assert.deepStrictEqual( R1, R2 );
});
