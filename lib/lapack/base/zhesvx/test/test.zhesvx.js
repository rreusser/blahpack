/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhesvx from './../lib/zhesvx.js';


// TESTS //

test( 'zhesvx is a function', function t() {
	assert.strictEqual( typeof zhesvx, 'function', 'is a function' );
});

test( 'zhesvx has expected arity', function t() {
	assert.strictEqual( zhesvx.length, 22, 'has expected arity' );
});

test( 'zhesvx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhesvx( 'column-major', 2, 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zhesvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhesvx( 'column-major', 'factored', 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zhesvx throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zhesvx( 'column-major', 'factored', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zhesvx allocates WORK and RWORK when they are null and solves A*X = B', function t() {
	// A = [ 4 1; 1 3 ] (Hermitian, symmetric and positive definite), B = A*[ 1; 2 ].
	const A = new Complex128Array( [ 4.0, 0.0, 1.0, 0.0, 1.0, 0.0, 3.0, 0.0 ] );
	const B = new Complex128Array( [ 6.0, 0.0, 7.0, 0.0 ] );
	const X = new Complex128Array( 2 );
	const rcond = new Float64Array( 1 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const xv = reinterpret( X, 0 );
	let info;
	let i;
	info = zhesvx( 'column-major', 'not-factored', 'upper', 2, 1, A, 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, B, 2, X, 2, rcond, FERR, 1, BERR, 1, null, null );
	assert.strictEqual( info, 0, 'info' );
	assert.ok( rcond[ 0 ] > 0.1, 'rcond: ' + rcond[ 0 ] );
	for ( i = 0; i < 4; i++ ) {
		assert.ok( Math.abs( xv[ i ] - [ 1.0, 0.0, 2.0, 0.0 ][ i ] ) <= 1e-14, 'X[' + i + ']: ' + xv[ i ] );
	}
	assert.ok( FERR[ 0 ] >= 0.0 && FERR[ 0 ] < 1e-12, 'FERR: ' + FERR[ 0 ] );
	assert.ok( BERR[ 0 ] >= 0.0 && BERR[ 0 ] <= 4.0 * 1.1102230246251565e-16, 'BERR: ' + BERR[ 0 ] );
});
