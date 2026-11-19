/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpbequ from './../lib/dpbequ.js';


// TESTS //

test( 'dpbequ is a function', function t() {
	assert.strictEqual( typeof dpbequ, 'function', 'is a function' );
});

test( 'dpbequ has expected arity', function t() {
	assert.strictEqual( dpbequ.length, 10, 'has expected arity' );
});

test( 'dpbequ throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		const scond = new Float64Array( 1 );
		const amax = new Float64Array( 1 );
		dpbequ( 'column-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, scond, amax );
	}, TypeError );
});

test( 'dpbequ throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const scond = new Float64Array( 1 );
		const amax = new Float64Array( 1 );
		dpbequ( 'column-major', 'upper', -1, 2, new Float64Array( 4 ), 2, 2, 1, scond, amax );
	}, RangeError );
});
