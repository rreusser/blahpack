
/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ddisna from './../lib/ddisna.js';


// TESTS //

test( 'ddisna is a function', function t() {
	assert.strictEqual( typeof ddisna, 'function', 'is a function' );
});

test( 'ddisna has expected arity', function t() {
	assert.strictEqual( ddisna.length, 7, 'has expected arity' );
});

test( 'ddisna throws TypeError for invalid job', function t() {
	assert.throws( function throws() {
		ddisna( 'invalid', 2, 2, new Float64Array( [ 1.0, 2.0 ] ), 1, new Float64Array( 2 ), 1 );
	}, TypeError );
});

test( 'ddisna throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		ddisna( 'eigenvalues', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'ddisna returns -3 for negative N with singular vectors (K = MIN(M,N) < 0), like strided.js', function t() {
	assert.strictEqual( ddisna( 'left-vectors', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 ), -3 );
	assert.strictEqual( ddisna( 'right-vectors', 2, -1, new Float64Array( 4 ), -2, new Float64Array( 4 ), -2 ), -3 );
});

test( 'ddisna ignores N for JOB = eigenvalues (reference: K = M, N not referenced)', function t() {
	const SEP = new Float64Array( 3 );
	const info = ddisna( 'eigenvalues', 3, -1, new Float64Array( [ 1.0, 2.0, 4.0 ] ), 1, SEP, 1 );
	assert.strictEqual( info, 0, 'info' );
	assert.deepStrictEqual( Array.from( SEP ), [ 1.0, 1.0, 2.0 ], 'SEP' );
});

test( 'ddisna: left singular vectors with M > N and negative strides (vector length K = MIN(M,N))', function t() {
	// Logical D = [ 5, 3, 0.5 ] (decreasing); gaps give SEP = [ 2, 2, 2.5 ], and since LEFT and M > N, SEP(K) = MIN( SEP(K), D(K) ) = 0.5.
	const d = new Float64Array( [ 0.5, 3.0, 5.0 ] );
	const SEP = new Float64Array( 3 );
	const info = ddisna( 'left-vectors', 5, 3, d, -1, SEP, -1 );
	assert.strictEqual( info, 0, 'info' );
	assert.deepStrictEqual( Array.from( SEP ), [ 0.5, 2.0, 2.0 ], 'SEP' );
});
