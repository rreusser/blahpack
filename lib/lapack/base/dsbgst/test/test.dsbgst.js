/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsbgst from './../lib/dsbgst.js';


// TESTS //

test( 'dsbgst is a function', function t() {
	assert.strictEqual( typeof dsbgst, 'function', 'is a function' );
});

test( 'dsbgst has expected arity', function t() {
	assert.strictEqual( dsbgst.length, 13, 'has expected arity' );
});

test( 'dsbgst throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsbgst( 'column-major', 'none', 'invalid', 3, 1, 1, new Float64Array( 9 ), 2, new Float64Array( 9 ), 2, new Float64Array( 9 ), 3, new Float64Array( 6 ) );
	}, /must be one of the following: "upper", "lower"|valid matrix triangle/ );
});

test( 'dsbgst throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsbgst( 'column-major', 'none', 'upper', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dsbgst accepts vect = "none" and rejects an unknown vect (reference VECT = N or V)', function t() {
	// The wrapper accepted only 'update', so 'none' (VECT = 'N') threw.
	const AB = new Float64Array( 6 );
	const BB = new Float64Array( 6 );
	assert.doesNotThrow( function none() {
		dsbgst( 'column-major', 'none', 'upper', 3, 1, 1, AB, 2, BB, 2, new Float64Array( 1 ), 1, new Float64Array( 6 ) );
	});
	assert.throws( function bad() {
		dsbgst( 'column-major', 'initialize', 'upper', 3, 1, 1, AB, 2, BB, 2, new Float64Array( 9 ), 3, new Float64Array( 6 ) );
	}, /Second argument must be one of the following: "none", "update"/ );
});
