/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsyev from './../lib/dsyev.js';


// TESTS //

test( 'dsyev is a function', function t() {
	assert.strictEqual( typeof dsyev, 'function', 'is a function' );
});

test( 'dsyev has expected arity', function t() {
	assert.strictEqual( dsyev.length, 9, 'has expected arity' );
});

test( 'dsyev throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsyev( 'invalid', 2, 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsyev throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsyev( 'row-major', 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsyev throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsyev( 'row-major', 'no-vectors', 'upper', -1, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dsyev throws a RangeError reporting length 0 when WORK is a non-array falsy value', function t() {
	const A = new Float64Array( [ 2.0, 1.0, 1.0, 2.0 ] );
	const w = new Float64Array( 2 );
	assert.throws( function throws() {
		dsyev( 'column-major', 'no-vectors', 'upper', 2, A, 2, w, 1, false );
	}, {
		'name': 'RangeError',
		'message': 'invalid argument. WORK array must have at least 5 elements from offset 0. Provided length: 0.'
	});
});

test( 'dsyev throws a RangeError reporting the provided length when WORK is too short', function t() {
	const A = new Float64Array( [ 2.0, 1.0, 1.0, 2.0 ] );
	const w = new Float64Array( 2 );
	assert.throws( function throws() {
		dsyev( 'column-major', 'no-vectors', 'upper', 2, A, 2, w, 1, new Float64Array( 4 ) );
	}, {
		'name': 'RangeError',
		'message': 'invalid argument. WORK array must have at least 5 elements from offset 0. Provided length: 4.'
	});
});

test( 'dsyev: a null WORK is allocated at the reference\'s optimal size (NB+2)*N, so the tridiagonal reduction is blocked as with an optimal workspace', function t() {
	const N = 48;
	const A0 = new Float64Array( N * N );
	let WORK;
	let w1;
	let w2;
	let A1;
	let A2;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			A0[ i + ( j * N ) ] = ( 1.0 / ( 1.0 + Math.abs( i - j ) ) ) + Math.sin( ( i + 1 ) * ( j + 1 ) );
		}
	}
	A1 = new Float64Array( A0 );
	A2 = new Float64Array( A0 );
	w1 = new Float64Array( N );
	w2 = new Float64Array( N );
	WORK = new Float64Array( ( 32 + 2 ) * N ); // ILAENV( 1, 'DSYTRD', 'L', N, -1, -1, -1 ) = 32
	assert.equal( dsyev( 'column-major', 'compute-vectors', 'lower', N, A1, N, w1, 1, null ), 0, 'info (null WORK)' );
	assert.equal( dsyev( 'column-major', 'compute-vectors', 'lower', N, A2, N, w2, 1, WORK ), 0, 'info (optimal WORK)' );
	assert.deepEqual( Array.from( w1 ), Array.from( w2 ), 'eigenvalues bit-identical' );
	assert.deepEqual( Array.from( A1 ), Array.from( A2 ), 'eigenvectors bit-identical' );
});
