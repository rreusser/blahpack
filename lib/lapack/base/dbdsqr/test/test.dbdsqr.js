/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dbdsqr from './../lib/dbdsqr.js';
import upper_4x4_values_only from './fixtures/upper_4x4_values_only.json' with { type: 'json' };


// TESTS //

test( 'dbdsqr is a function', function t() {
	assert.strictEqual( typeof dbdsqr, 'function', 'is a function' );
});

test( 'dbdsqr has expected arity', function t() {
	assert.strictEqual( dbdsqr.length, 17, 'has expected arity' );
});

test( 'dbdsqr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dbdsqr( 'invalid', 'upper', new Float64Array( 4 ), 2, 2, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dbdsqr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dbdsqr( 'row-major', 'invalid', new Float64Array( 4 ), 2, 2, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dbdsqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dbdsqr( 'row-major', 'upper', -1, 2, 2, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dbdsqr allocates enough workspace for dlasq1 when WORK is null (values only)', function t() {
	const tc = upper_4x4_values_only;
	const d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0 ] );
	const e = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	let info;
	let i;

	// DBDSQR calls DLASQ1 (dbdsqr.f:337), whose WORK is dimension 4*N:
	info = dbdsqr( 'column-major', 'upper', 4, 0, 0, 0, d, 1, e, 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, null ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	for ( i = 0; i < 4; i++ ) {
		assert.ok( Math.abs( d[ i ] - tc.d[ i ] ) <= 1e-14 * tc.d[ i ], 'd[' + i + ']: expected ' + tc.d[ i ] + ', got ' + d[ i ] );
	}
});
