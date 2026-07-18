/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsprfs from './../lib/zsprfs.js';


// FUNCTIONS //

// Build a Complex128Array from a flat float array of interleaved re/im pairs.
function cArr( pairs ) {
	const f = new Float64Array( pairs.length );
	let i;
	for ( i = 0; i < pairs.length; i++ ) {
		f[ i ] = pairs[ i ];
	}
	return new Complex128Array( f.buffer );
}


// TESTS //

test( 'zsprfs is a function', function t() {
	assert.strictEqual( typeof zsprfs, 'function', 'is a function' );
});

test( 'zsprfs has expected arity', function t() {
	assert.strictEqual( zsprfs.length, 19, 'has expected arity' );
});

test( 'zsprfs: throws TypeError for invalid uplo', function t() {
	assert.throws( function f() {
		zsprfs( 'invalid', 1, 1, new Complex128Array( 1 ), new Complex128Array( 1 ), new Int32Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, null, 1, null, 1 );
	}, TypeError );
});

test( 'zsprfs: auto-allocates WORK/RWORK when null (2x2 diagonal)', function t() {
	// A = diag(2, 3), AFP = AP, IPIV = [0, 1]; X = [1, 1], B = A*X = [2, 3].

	const AP = cArr( [ 2, 0, 0, 0, 3, 0 ] );
	const AFP = cArr( [ 2, 0, 0, 0, 3, 0 ] );
	const IPIV = new Int32Array( [ 0, 1 ] );
	const B = cArr( [ 2, 0, 3, 0 ] );
	const X = cArr( [ 1, 0, 1, 0 ] );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );

	// Pass `null` for WORK/RWORK so the wrapper allocates them.
	const info = zsprfs( 'upper', 2, 1, AP, AFP, IPIV, 1, B, 2, X, 2, FERR, 1, BERR, 1, null, 1, null, 1 );
	assert.equal( info, 0, 'info is 0' );
	assert.ok( BERR[ 0 ] < 1e-12, 'BERR should be tiny: ' + BERR[ 0 ] );
	assert.ok( FERR[ 0 ] >= 0, 'FERR should be non-negative' );
});

test( 'zsprfs: accepts caller-provided WORK/RWORK (2x2 diagonal)', function t() {

	const AP = cArr( [ 2, 0, 0, 0, 3, 0 ] );
	const AFP = cArr( [ 2, 0, 0, 0, 3, 0 ] );
	const IPIV = new Int32Array( [ 0, 1 ] );
	const B = cArr( [ 2, 0, 3, 0 ] );
	const X = cArr( [ 1, 0, 1, 0 ] );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Complex128Array( 4 );
	const RWORK = new Float64Array( 2 );

	const info = zsprfs( 'upper', 2, 1, AP, AFP, IPIV, 1, B, 2, X, 2, FERR, 1, BERR, 1, WORK, 1, RWORK, 1 );
	assert.equal( info, 0, 'info is 0' );
	assert.ok( BERR[ 0 ] < 1e-12, 'BERR should be tiny: ' + BERR[ 0 ] );
});
