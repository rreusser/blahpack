/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztrsen from './../lib/ztrsen.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import { assertNullWorkspaceSufficient, values } from './../../../../../test/harness/nullwork.js';


// TESTS //

test( 'ztrsen is a function', function t() {
	assert.strictEqual( typeof ztrsen, 'function', 'is a function' );
});

test( 'ztrsen has expected arity', function t() {
	assert.strictEqual( ztrsen.length, 16, 'has expected arity' );
});

test( 'ztrsen throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztrsen( 'column-major', 'none', 'none', new Float64Array( 4 ), 1, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ) );
	}, RangeError );
});

// CONVENTIONS D5c (ticket 0060): with WORK = null the wrapper must allocate a
// sufficient workspace, so results are identical to an ample caller buffer.
test( 'ztrsen: WORK = null allocates a sufficient workspace (every job)', function t() {
	const N = 5;
	[ 'none', 'eigenvalues', 'subspace', 'both' ].forEach( function each( job ) {
		assertNullWorkspaceSufficient( ztrsen, function args() {
			const T = values( 2 * N * N, 1 );
			const Q = new Float64Array( 2 * N * N );
			for ( let j = 0; j < N; j++ ) {
				for ( let i = j + 1; i < N; i++ ) {
					T[ 2 * ( i + ( j * N ) ) ] = 0.0;
					T[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = 0.0;
				}
				T[ 2 * ( j + ( j * N ) ) ] = j + 1;
				Q[ 2 * ( j + ( j * N ) ) ] = 1.0;
			}
			return [ 'column-major', job, 'update', new Uint8Array( [ 0, 1, 0, 1, 1 ] ), 1, N, new Complex128Array( T ), N, new Complex128Array( Q ), N, new Complex128Array( N ), 1, new Int32Array( 1 ), new Float64Array( 1 ), new Float64Array( 1 ), null ];
		}, 15, function ample() {
			return new Complex128Array( 1000 );
		}, 'ztrsen ' + job );
	});
});
