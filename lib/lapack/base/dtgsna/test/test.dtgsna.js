/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dtgsna from './../lib/dtgsna.js';


// TESTS //

test( 'dtgsna is a function', function t() {
	assert.strictEqual( typeof dtgsna, 'function', 'is a function' );
});

test( 'dtgsna has expected arity', function t() {
	assert.strictEqual( dtgsna.length, 22, 'has expected arity' );
});

test( 'dtgsna throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtgsna( 'invalid', 'no-transpose', 'no-transpose', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtgsna throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtgsna( 'row-major', 'eigenvalues', 'all', new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dtgsna: row-major VL/VR must have room for mm columns', function t() {
	// Regression (tickets/0001): the row-major bound was `max( 1, M )` with M
	// the Int32Array output, i.e. NaN, so an undersized LDVL/LDVR was never rejected.
	function run( LDV ) {
		const A = new Float64Array( [ 1.0, 0.0, 0.0, 2.0 ] );
		const B = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
		const VL = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
		const VR = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
		return dtgsna( 'row-major', 'eigenvalues', 'all', new Uint8Array( 2 ), 1, 2, A, 2, B, 2, VL, LDV, VR, LDV, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Float64Array( 64 ), new Int32Array( 8 ) );
	}
	assert.throws( function bad() {
		run( 1 );
	}, RangeError );
	assert.doesNotThrow( function good() {
		run( 2 );
	});
});
