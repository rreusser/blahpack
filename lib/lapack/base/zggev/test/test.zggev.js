/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zggev from './../lib/zggev.js';


// TESTS //

test( 'zggev is a function', function t() {
	assert.strictEqual( typeof zggev, 'function', 'is a function' );
});

test( 'zggev has expected arity', function t() {
	assert.strictEqual( zggev.length, 18, 'has expected arity' );
});

test( 'zggev throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zggev( 'invalid', 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zggev throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zggev( 'row-major', 'no-vectors', 'no-vectors', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zggev throws RangeError when jobvl = compute-vectors and 1 <= LDVL < N', function t() {
	assert.throws( function throws() {
		zggev( 'column-major', 'compute-vectors', 'no-vectors', 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, null, null );
	}, RangeError );
});

test( 'zggev throws RangeError when jobvr = compute-vectors and 1 <= LDVR < N', function t() {
	assert.throws( function throws() {
		zggev( 'column-major', 'no-vectors', 'compute-vectors', 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, null, null );
	}, RangeError );
});
