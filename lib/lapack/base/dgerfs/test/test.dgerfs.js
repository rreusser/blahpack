/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgerfs from './../lib/dgerfs.js';


// TESTS //

test( 'dgerfs is a function', function t() {
	assert.strictEqual( typeof dgerfs, 'function', 'is a function' );
});

test( 'dgerfs has expected arity', function t() {
	assert.strictEqual( dgerfs.length, 20, 'has expected arity' );
});

test( 'dgerfs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dgerfs( 'column-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dgerfs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgerfs( 'column-major', 'no-transpose', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgerfs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dgerfs( 'column-major', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgerfs allocates its workspaces when work and iwork are omitted', function t() {
	// A = [ 4 1; 0 3 ] (column-major) is its own LU factorization (no row interchanges, 0-based IPIV).
	const A = new Float64Array( [ 4.0, 0.0, 1.0, 3.0 ] );
	const AF = new Float64Array( [ 4.0, 0.0, 1.0, 3.0 ] );
	const IPIV = new Int32Array( [ 0, 1 ] );
	const B = new Float64Array( [ 6.0, 6.0 ] );
	const X = new Float64Array( [ 1.0, 2.0 ] ); // exact solution of A*X = B
	const FERR = new Float64Array( [ -1.0 ] );
	const BERR = new Float64Array( [ -1.0 ] );
	const info = dgerfs( 'column-major', 'no-transpose', 2, 1, A, 2, AF, 2, IPIV, 1, B, 2, X, 2, FERR, 1, BERR, 1 );
	assert.strictEqual( info, 0, 'info' );
	assert.deepStrictEqual( Array.from( X ), [ 1.0, 2.0 ], 'X' );
	assert.strictEqual( BERR[ 0 ], 0.0, 'BERR' );
	assert.ok( FERR[ 0 ] >= 0.0 && FERR[ 0 ] < 1e-14, 'FERR: ' + FERR[ 0 ] );
});
