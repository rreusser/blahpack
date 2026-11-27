/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zposvx from './../lib/zposvx.js';


// TESTS //

test( 'zposvx is a function', function t() {
	assert.strictEqual( typeof zposvx, 'function', 'is a function' );
});

test( 'zposvx has expected arity', function t() {
	assert.strictEqual( zposvx.length, 23, 'has expected arity' );
});

test( 'zposvx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zposvx( 'column-major', 2, 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zposvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zposvx( 'column-major', 'equilibrate', 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zposvx throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zposvx( 'column-major', 'equilibrate', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zposvx throws TypeError for an invalid equed when fact is factored', function t() {
	assert.throws( function throws() {
		zposvx( 'column-major', 'factored', 'upper', 2, 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, [ 'bogus' ], new Float64Array( 2 ), 1, new Complex128Array( 2 ), 2, new Complex128Array( 2 ), 2, new Float64Array( 1 ), new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, null, null );
	}, /Tenth argument is invalid/ );
});

test( 'zposvx allocates WORK and RWORK when they are null and solves A*X = B', function t() {
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
	info = zposvx( 'column-major', 'not-factored', 'upper', 2, 1, A, 2, new Complex128Array( 4 ), 2, [ 'none' ], new Float64Array( 2 ), 1, B, 2, X, 2, rcond, FERR, 1, BERR, 1, null, null );
	assert.strictEqual( info, 0, 'info' );
	assert.ok( rcond[ 0 ] > 0.1, 'rcond: ' + rcond[ 0 ] );
	for ( i = 0; i < 4; i++ ) {
		assert.ok( Math.abs( xv[ i ] - [ 1.0, 0.0, 2.0, 0.0 ][ i ] ) <= 1e-14, 'X[' + i + ']: ' + xv[ i ] );
	}
	assert.ok( FERR[ 0 ] >= 0.0 && FERR[ 0 ] < 1e-12, 'FERR: ' + FERR[ 0 ] );
	assert.ok( BERR[ 0 ] >= 0.0 && BERR[ 0 ] <= 4.0 * 1.1102230246251565e-16, 'BERR: ' + BERR[ 0 ] );
});
