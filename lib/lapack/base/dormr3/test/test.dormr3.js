/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dormr3 from './../lib/dormr3.js';
import { assertNullWorkspaceSufficient, values } from './../../../../../test/harness/nullwork.js';


// TESTS //

test( 'dormr3 is a function', function t() {
	assert.strictEqual( typeof dormr3, 'function', 'is a function' );
});

test( 'dormr3 has expected arity', function t() {
	assert.strictEqual( dormr3.length, 14, 'has expected arity' );
});

test( 'dormr3 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dormr3( 'invalid', 'left', 'no-transpose', 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormr3 throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dormr3( 'row-major', 'invalid', 'no-transpose', 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormr3 throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dormr3( 'row-major', 'left', 'invalid', 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormr3 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dormr3( 'row-major', 'left', 'no-transpose', -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormr3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dormr3( 'row-major', 'left', 'no-transpose', 2, -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormr3 throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dormr3( 'row-major', 'left', 'no-transpose', 2, 2, -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

// CONVENTIONS D5c (ticket 0060): with WORK = null the wrapper must allocate a
// sufficient workspace, so results are identical to an ample caller buffer.
test( 'dormr3: WORK = null allocates a sufficient workspace (both sides)', function t() {
	const M = 5;
	const N = 4;
	const K = 3;
	[ 'left', 'right' ].forEach( function each( side ) {
		const nq = ( side === 'left' ) ? M : N;
		assertNullWorkspaceSufficient( dormr3, function args() {
			return [ 'column-major', side, 'no-transpose', M, N, K, 2, values( K * nq, 1 ), K, values( K, 3 ), 1, values( M * N, 2 ), M, null ];
		}, 13, function ample() {
			return new Float64Array( 1000 );
		}, 'dormr3 ' + side );
	});
});
