/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zhbgst from './../lib/zhbgst.js';


// TESTS //

test( 'zhbgst is a function', function t() {
	assert.strictEqual( typeof zhbgst, 'function', 'is a function' );
});

test( 'zhbgst has expected arity', function t() {
	assert.strictEqual( zhbgst.length, 14, 'has expected arity' );
});

test( 'zhbgst throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhbgst( 'column-major', 'none', 'invalid', 3, 1, 1, new Complex128Array( 9 ), 2, new Complex128Array( 9 ), 2, new Complex128Array( 9 ), 3, new Complex128Array( 3 ) );
	}, /must be one of the following: "upper", "lower"|valid matrix triangle/ );
});

test( 'zhbgst throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhbgst( 'column-major', 'none', 'upper', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zhbgst accepts vect = "none" and rejects an unknown vect (reference VECT = N or V)', function t() {
	// The wrapper accepted only 'update', so 'none' (VECT = 'N') threw.
	const AB = new Complex128Array( 6 );
	const BB = new Complex128Array( 6 );
	assert.doesNotThrow( function none() {
		zhbgst( 'column-major', 'none', 'upper', 3, 1, 1, AB, 2, BB, 2, new Complex128Array( 1 ), 1, new Complex128Array( 3 ) );
	});
	assert.throws( function bad() {
		zhbgst( 'column-major', 'initialize', 'upper', 3, 1, 1, AB, 2, BB, 2, new Complex128Array( 9 ), 3, new Complex128Array( 3 ) );
	}, /Second argument must be one of the following: "none", "update"/ );
});
