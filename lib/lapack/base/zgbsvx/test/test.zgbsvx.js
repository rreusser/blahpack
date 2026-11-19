/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgbsvx from './../lib/zgbsvx.js';


// TESTS //

test( 'zgbsvx is a function', function t() {
	assert.strictEqual( typeof zgbsvx, 'function', 'is a function' );
});

test( 'zgbsvx has expected arity', function t() {
	assert.strictEqual( zgbsvx.length, 29, 'has expected arity' );
});

test( 'zgbsvx throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		const rcond = new Float64Array( 1 );
		zgbsvx( 'column-major', 2, 'invalid', new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, rcond, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zgbsvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const rcond = new Float64Array( 1 );
		zgbsvx( 'column-major', 'equilibrate', 'no-transpose', -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, rcond, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgbsvx throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		const rcond = new Float64Array( 1 );
		zgbsvx( 'column-major', 'equilibrate', 'no-transpose', new Float64Array( 4 ), 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, rcond, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
