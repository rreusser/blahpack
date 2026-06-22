import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhecon from '../lib/ndarray.js';

// FIXTURES //

import upper4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import identityUpper from './fixtures/identity_upper.json' with { type: 'json' };
import identityLower from './fixtures/identity_lower.json' with { type: 'json' };
import n1Upper from './fixtures/n1_upper.json' with { type: 'json' };
import lower6x6 from './fixtures/lower_6x6.json' with { type: 'json' };
import upper6x6 from './fixtures/upper_6x6.json' with { type: 'json' };

var fixtures = {
	'upper_4x4': upper4x4,
	'lower_4x4': lower4x4,
	'identity_upper': identityUpper,
	'identity_lower': identityLower,
	'n1_upper': n1Upper,
	'lower_6x6': lower6x6,
	'upper_6x6': upper6x6
};

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

/**
* Pack a flat double-precision array from Fortran column-major (LDA=NMAX=6)
* into packed N*N Complex128Array.
*/
function packComplex( flatDoubles, N, LDA ) {
	var out = new Complex128Array( N * N );
	var ov = reinterpret( out, 0 );
	var j;
	var i;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			ov[ 2 * ( i + j * N ) ] = flatDoubles[ 2 * ( i + j * LDA ) ];
			ov[ 2 * ( i + j * N ) + 1 ] = flatDoubles[ 2 * ( i + j * LDA ) + 1 ];
		}
	}
	return out;
}

/**
* Convert Fortran 1-based IPIV to 0-based with bitwise-NOT convention.
*/
function convertIPIV( ipivFortran, N ) {
	var out = new Int32Array( N );
	var i;
	for ( i = 0; i < N; i++ ) {
		if ( ipivFortran[ i ] > 0 ) {
			out[ i ] = ipivFortran[ i ] - 1;
		} else {
			out[ i ] = ~( -ipivFortran[ i ] - 1 );
		}
	}
	return out;
}

/**
* Run a fixture-based zhecon test.
*/
function runFixtureTest( name, uplo ) {
	var LDA = 6; // NMAX in Fortran test
	var tc = fixtures[ name ];
	var N = tc.n;

	// For N=1 test, the fixture data only has N rows (not NMAX)
	var actualLDA = ( tc.A_factored.length / 2 >= LDA * N ) ? LDA : N;

	var A = packComplex( tc.A_factored, N, actualLDA );
	var IPIV = convertIPIV( tc.ipiv, N );
	var WORK = new Complex128Array( 2 * N );
	var rcond = new Float64Array( 1 );

	var info = zhecon( uplo, N, A, 1, N, 0, IPIV, 1, 0, tc.anorm, rcond, WORK, 1, 0 );
	assert.strictEqual( info, 0, name + ' info' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-10, name + ' rcond' );
}

// TESTS //

test( 'zhecon: main export is a function', function t() {
	assert.strictEqual( typeof zhecon, 'function' );
});

test( 'zhecon: upper 4x4', function t() {
	runFixtureTest( 'upper_4x4', 'upper' );
});

test( 'zhecon: lower 4x4', function t() {
	runFixtureTest( 'lower_4x4', 'lower' );
});

test( 'zhecon: identity 3x3 (upper, rcond=1)', function t() {
	runFixtureTest( 'identity_upper', 'upper' );
});

test( 'zhecon: identity 3x3 (lower, rcond=1)', function t() {
	runFixtureTest( 'identity_lower', 'lower' );
});

test( 'zhecon: N=1 (upper)', function t() {
	runFixtureTest( 'n1_upper', 'upper' );
});

test( 'zhecon: lower 6x6 (2x2 pivots)', function t() {
	runFixtureTest( 'lower_6x6', 'lower' );
});

test( 'zhecon: upper 6x6 (2x2 pivots)', function t() {
	runFixtureTest( 'upper_6x6', 'upper' );
});

test( 'zhecon: N=0 (rcond=1)', function t() {
	var A = new Complex128Array( 1 );
	var IPIV = new Int32Array( 1 );
	var WORK = new Complex128Array( 1 );
	var rcond = new Float64Array( 1 );
	var info = zhecon( 'upper', 0, A, 1, 1, 0, IPIV, 1, 0, 0.0, rcond, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});

test( 'zhecon: anorm=0 returns rcond=0', function t() {
	var A = new Complex128Array( 4 );
	var Av = reinterpret( A, 0 );
	Av[ 0 ] = 1.0; // A(0,0) = 1+0i
	Av[ 6 ] = 1.0; // A(1,1) = 1+0i
	var IPIV = new Int32Array( [ 0, 1 ] );
	var WORK = new Complex128Array( 4 );
	var rcond = new Float64Array( 1 );
	var info = zhecon( 'upper', 2, A, 1, 2, 0, IPIV, 1, 0, 0.0, rcond, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'zhecon: anorm<0 returns rcond=0', function t() {
	var A = new Complex128Array( 4 );
	var Av = reinterpret( A, 0 );
	Av[ 0 ] = 1.0;
	Av[ 6 ] = 1.0;
	var IPIV = new Int32Array( [ 0, 1 ] );
	var WORK = new Complex128Array( 4 );
	var rcond = new Float64Array( 1 );
	var info = zhecon( 'upper', 2, A, 1, 2, 0, IPIV, 1, 0, -1.0, rcond, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});
