
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgges from './../lib/dgges.js';


// FUNCTIONS //

/**
* Noop selection function.
*
* @private
* @returns {boolean} false
*/
function noop() {
	return false;
}


// TESTS //

test( 'dgges is a function', function t() {
	assert.strictEqual( typeof dgges, 'function', 'is a function' );
});

test( 'dgges has expected arity', function t() {
	assert.strictEqual( dgges.length, 23, 'has expected arity' );
});

test( 'dgges throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		const sdim = new Int32Array( 1 );
		dgges( 'invalid', 'compute-vectors', 'compute-vectors', 'none', noop, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, sdim, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dgges throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const sdim = new Int32Array( 1 );
		dgges( 'row-major', 'compute-vectors', 'compute-vectors', 'none', noop, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, sdim, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dgges throws RangeError for invalid LDA', function t() {
	assert.throws( function throws() {
		const sdim = new Int32Array( 1 );
		dgges( 'row-major', 'compute-vectors', 'compute-vectors', 'none', noop, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, sdim, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dgges throws RangeError for invalid LDB', function t() {
	assert.throws( function throws() {
		const sdim = new Int32Array( 1 );
		dgges( 'row-major', 'compute-vectors', 'compute-vectors', 'none', noop, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, sdim, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 ); // eslint-disable-line max-len
	}, RangeError );
});
