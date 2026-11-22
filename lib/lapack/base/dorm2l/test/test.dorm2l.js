/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorm2l from './../lib/dorm2l.js';
import { assertNullWorkspaceSufficient, values } from './../../../../../test/harness/nullwork.js';


// TESTS //

test( 'dorm2l is a function', function t() {
	assert.strictEqual( typeof dorm2l, 'function', 'is a function' );
});

test( 'dorm2l has expected arity', function t() {
	assert.strictEqual( dorm2l.length, 13, 'has expected arity' );
});

test( 'dorm2l throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dorm2l( 'column-major', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dorm2l throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dorm2l( 'column-major', 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dorm2l throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dorm2l( 'column-major', 'left', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dorm2l throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dorm2l( 'column-major', 'left', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dorm2l throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dorm2l( 'column-major', 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

// CONVENTIONS D5c (ticket 0060): with WORK = null the wrapper must allocate a
// sufficient workspace, so results are identical to an ample caller buffer.
test( 'dorm2l: WORK = null allocates a sufficient workspace (both sides)', function t() {
	const M = 5;
	const N = 4;
	const K = 3;
	[ 'left', 'right' ].forEach( function each( side ) {
		const nq = ( side === 'left' ) ? M : N;
		assertNullWorkspaceSufficient( dorm2l, function args() {
			return [ 'column-major', side, 'no-transpose', M, N, K, values( nq * K, 1 ), nq, values( K, 3 ), 1, values( M * N, 2 ), M, null ];
		}, 12, function ample() {
			return new Float64Array( 1000 );
		}, 'dorm2l ' + side );
	});
});
