/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dopmtr from './../lib/dopmtr.js';
import { assertNullWorkspaceSufficient, values } from '../../../../test/harness/nullwork.js';


// TESTS //

test( 'dopmtr is a function', function t() {
	assert.strictEqual( typeof dopmtr, 'function', 'is a function' );
});

test( 'dopmtr has expected arity', function t() {
	assert.strictEqual( dopmtr.length, 12, 'has expected arity' );
});

test( 'dopmtr throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dopmtr( 'column-major', 'invalid', 'upper', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dopmtr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dopmtr( 'column-major', 'left', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dopmtr throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dopmtr( 'column-major', 'left', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dopmtr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dopmtr( 'column-major', 'left', 'upper', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dopmtr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dopmtr( 'column-major', 'left', 'upper', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

// CONVENTIONS D5c (ticket 0060): with WORK = null the wrapper must allocate a
// sufficient workspace, so results are identical to an ample caller buffer.
test( 'dopmtr: WORK = null allocates a sufficient workspace (both sides)', function t() {
	const M = 5;
	const N = 4;
	[ 'left', 'right' ].forEach( function each( side ) {
		const nq = ( side === 'left' ) ? M : N;
		assertNullWorkspaceSufficient( dopmtr, function args() {
			return [ 'column-major', side, 'upper', 'no-transpose', M, N, values( ( nq * ( nq + 1 ) ) / 2, 1 ), values( nq - 1, 3 ), 1, values( M * N, 2 ), M, null ];
		}, 11, function ample() {
			return new Float64Array( 1000 );
		}, 'dopmtr ' + side );
	});
});
