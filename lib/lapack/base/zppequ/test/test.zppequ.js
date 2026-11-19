/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zppequ from './../lib/zppequ.js';


// TESTS //

test( 'zppequ is a function', function t() {
	assert.strictEqual( typeof zppequ, 'function', 'is a function' );
});

test( 'zppequ has expected arity', function t() {
	assert.strictEqual( zppequ.length, 8, 'has expected arity' );
});

test( 'zppequ throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		const scond = new Float64Array( 1 );
		const amax = new Float64Array( 1 );
		zppequ( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, scond, amax );
	}, TypeError );
});

test( 'zppequ throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const scond = new Float64Array( 1 );
		const amax = new Float64Array( 1 );
		zppequ( 'column-major', 'upper', -1, new Float64Array( 4 ), 2, 1, scond, amax );
	}, RangeError );
});
