/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarf from './../lib/dlarf.js';
import { assertNullWorkspaceSufficient, values } from './../../../../../test/harness/nullwork.js';


// TESTS //

test( 'dlarf is a function', function t() {
	assert.strictEqual( typeof dlarf, 'function', 'is a function' );
});

test( 'dlarf has expected arity', function t() {
	assert.strictEqual( dlarf.length, 10, 'has expected arity' );
});

test( 'dlarf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlarf( 'invalid', 'left', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlarf throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dlarf( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlarf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlarf( 'row-major', 'left', -1, new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dlarf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlarf( 'row-major', 'left', new Float64Array( 4 ), -1, 2, 1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

// CONVENTIONS D5c (ticket 0060): with WORK = null the wrapper must allocate a
// sufficient workspace, so results are identical to an ample caller buffer.
test( 'dlarf: WORK = null allocates a sufficient workspace (both sides)', function t() {
	const M = 5;
	const N = 4;
	[ 'left', 'right' ].forEach( function each( side ) {
		const nq = ( side === 'left' ) ? M : N;
		assertNullWorkspaceSufficient( dlarf, function args() {
			return [ 'column-major', side, M, N, values( nq, 1 ), 1, 0.7, values( M * N, 2 ), M, null ];
		}, 9, function ample() {
			return new Float64Array( 1000 );
		}, 'dlarf ' + side );
	});
});
