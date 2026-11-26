/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zheev from './../lib/zheev.js';


// TESTS //

test( 'zheev is a function', function t() {
	assert.strictEqual( typeof zheev, 'function', 'is a function' );
});

test( 'zheev has expected arity', function t() {
	assert.strictEqual( zheev.length, 10, 'has expected arity' );
});

test( 'zheev throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zheev( 'invalid', 2, 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zheev throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zheev( 'row-major', 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zheev throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zheev( 'row-major', 'no-vectors', 'upper', -1, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zheev: a null WORK is allocated at the reference\'s optimal size (NB+1)*N, so the tridiagonal reduction is blocked as with an optimal workspace', function t() {
	const N = 48;
	const A0 = new Complex128Array( N * N );
	const v = reinterpret( A0, 0 );
	let WORK;
	let w1;
	let w2;
	let A1;
	let A2;
	let k;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			k = 2 * ( i + ( j * N ) );
			v[ k ] = ( 1.0 / ( 1.0 + Math.abs( i - j ) ) ) + Math.sin( ( i + 1 ) * ( j + 1 ) );
			v[ k + 1 ] = ( i === j ) ? 0.0 : Math.cos( ( i + 1 ) + ( 2 * ( j + 1 ) ) );
		}
	}
	A1 = new Complex128Array( A0 );
	A2 = new Complex128Array( A0 );
	w1 = new Float64Array( N );
	w2 = new Float64Array( N );
	WORK = new Complex128Array( ( 32 + 1 ) * N ); // ILAENV( 1, 'ZHETRD', 'U', N, -1, -1, -1 ) = 32
	assert.equal( zheev( 'column-major', 'compute-vectors', 'upper', N, A1, N, w1, 1, null, null ), 0, 'info (null WORK)' );
	assert.equal( zheev( 'column-major', 'compute-vectors', 'upper', N, A2, N, w2, 1, WORK, null ), 0, 'info (optimal WORK)' );
	assert.deepEqual( Array.from( w1 ), Array.from( w2 ), 'eigenvalues bit-identical' );
	assert.deepEqual( Array.from( reinterpret( A1, 0 ) ), Array.from( reinterpret( A2, 0 ) ), 'eigenvectors bit-identical' );
});
