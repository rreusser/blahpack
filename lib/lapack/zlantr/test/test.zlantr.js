/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlantr from './../lib/zlantr.js';


// TESTS //

test( 'zlantr is a function', function t() {
	assert.strictEqual( typeof zlantr, 'function', 'is a function' );
});

test( 'zlantr has expected arity', function t() {
	assert.strictEqual( zlantr.length, 9, 'has expected arity' );
});

test( 'zlantr throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlantr( 'column-major', 'invalid', 'upper', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlantr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlantr( 'column-major', 'max', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlantr throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		zlantr( 'column-major', 'max', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlantr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlantr( 'column-major', 'max', 'upper', 'non-unit', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zlantr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlantr( 'column-major', 'max', 'upper', 'non-unit', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});
