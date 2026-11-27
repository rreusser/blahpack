/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dppequ from './../lib/dppequ.js';


// TESTS //

test( 'dppequ is a function', function t() {
	assert.strictEqual( typeof dppequ, 'function', 'is a function' );
});

test( 'dppequ has expected arity', function t() {
	assert.strictEqual( dppequ.length, 8, 'has expected arity' );
});

test( 'dppequ throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		const scond = new Float64Array( 1 );
		const amax = new Float64Array( 1 );
		dppequ( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, scond, amax );
	}, TypeError );
});

test( 'dppequ throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const scond = new Float64Array( 1 );
		const amax = new Float64Array( 1 );
		dppequ( 'column-major', 'upper', -1, new Float64Array( 4 ), 2, 1, scond, amax );
	}, RangeError );
});
