/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dla_syrpvgrw from './../lib/index.js';


// FIXTURES //

var FIXTURES_DIR = path.join( import.meta.dirname, 'fixtures' );
var FIXTURES = fs.readdirSync( FIXTURES_DIR ).filter( function f( n ) {
	return n.slice( -5 ) === '.json';
}).map( function m( n ) {
	return JSON.parse( fs.readFileSync( path.join( FIXTURES_DIR, n ), 'utf8' ) );
});


// FUNCTIONS //

// Convert Fortran-style 1-based IPIV (positive = swap row, negative = 2x2 pivot block) to JS-style 0-based.
function convertIPIV( ipiv ) {
	var out = new Int32Array( ipiv.length );
	var i;
	var v;
	for ( i = 0; i < ipiv.length; i++ ) {
		v = ipiv[ i ];
		if ( v > 0 ) {
			out[ i ] = v - 1;
		} else {
			// Fortran IPIV[k]=-X means swap row X (1-based) = X-1 (0-based);
			// JS encoding: ~(X-1) = -X. Numerically same value.
			out[ i ] = v;
		}
	}
	return out;
}

function approxEqual( actual, expected, tol, msg ) {
	var abs = Math.abs( actual - expected );
	var ref = Math.max( Math.abs( expected ), 1.0 );
	assert.ok( abs <= tol * ref, msg + ' got=' + actual + ' expected=' + expected );
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dla_syrpvgrw, 'function', 'is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dla_syrpvgrw.ndarray, 'function', 'has ndarray method' );
});

test( 'ndarray throws TypeError for invalid uplo', function t() {
	assert.throws( function f() {
		dla_syrpvgrw.ndarray( 'invalid', 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Int32Array( 1 ), 1, 0, new Float64Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'ndarray throws RangeError for negative N', function t() {
	assert.throws( function f() {
		dla_syrpvgrw.ndarray( 'upper', -1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Int32Array( 1 ), 1, 0, new Float64Array( 2 ), 1, 0 );
	}, RangeError );
});

// Drive every fixture through the ndarray entry point.
FIXTURES.forEach( function each( fx ) {
	test( 'ndarray fixture: ' + fx.name, function t() {
		var N = fx.N;
		var info = fx.INFO;
		var A = new Float64Array( N * N );
		var AF = new Float64Array( N * N );
		var IPIV;
		var WORK = new Float64Array( 2 * N );
		var i;
		var rpvgrw;

		// Fixtures may be empty for tiny N=1 cases.
		if ( fx.A ) {
			for ( i = 0; i < fx.A.length; i++ ) {
				A[ i ] = fx.A[ i ];
				AF[ i ] = fx.AF[ i ];
			}
		}
		IPIV = convertIPIV( fx.IPIV );

		// Column-major: strideA1=1, strideA2=N
		rpvgrw = dla_syrpvgrw.ndarray( ( fx.N === 0 ) ? 'upper' : ( ( fx.name.indexOf( 'upper' ) >= 0 ) ? 'upper' : 'lower' ), N, info, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, WORK, 1, 0 );
		approxEqual( rpvgrw, fx.rpvgrw, 1e-12, 'rpvgrw' );

		// Verify WORK contents match expectation when full inputs are provided.
		if ( fx.WORK && fx.A && N > 0 ) {
			for ( i = 0; i < 2 * N; i++ ) {
				approxEqual( WORK[ i ], fx.WORK[ i ], 1e-12, 'WORK[' + i + ']' );
			}
		}
	});
});

test( 'ndarray N=0 returns 1', function t() {
	var rpvgrw = dla_syrpvgrw.ndarray( 'upper', 0, 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 1, 0, new Int32Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0 );
	assert.strictEqual( rpvgrw, 1.0 );
});

test( 'ndarray respects strides and offsets (lower)', function t() {
	// 2x2 lower with offset and stride padding.
	// Underlying: A col-major [a00, a10, _, _, _, a01, a11, _]
	// A = [[1,0],[2,3]] (lower stored), AF = [[1,0],[2,1]]
	var A = new Float64Array( 8 );
	var AF = new Float64Array( 8 );
	var IPIV = new Int32Array( 4 );
	var WORK = new Float64Array( 4 );
	var rpvgrw;
	A[ 0 ] = 1; A[ 1 ] = 2; A[ 4 ] = 0; A[ 5 ] = 3;
	AF[ 0 ] = 1; AF[ 1 ] = 2; AF[ 4 ] = 0; AF[ 5 ] = 1;
	IPIV[ 0 ] = 0; IPIV[ 1 ] = 1; // identity (no swaps)
	rpvgrw = dla_syrpvgrw.ndarray( 'lower', 2, 0, A, 1, 4, 0, AF, 1, 4, 0, IPIV, 1, 0, WORK, 1, 0 );

	// Column 0: max(|A|) = 2, max(|AF|) = 2 → ratio 1. Column 1: max(|A|)=3, max(|AF|)=1 → 3.

	// rpvgrw = min(1, 3) = 1
	approxEqual( rpvgrw, 1.0, 1e-12, 'rpvgrw' );
});

test( 'ndarray triggers diagonal update branch (lower 2x2 pivot, AF[k,k] dominant)', function t() {
	// Fabricate inputs where AF[k,k] is larger than all AF[i,k] for i>k in a 2x2 pivot.
	// 3x3 lower; 2x2 pivot at k=0,1 then 1x1 at k=2.
	var N = 3;
	var A = new Float64Array( [ 1, 1, 1, 0, 1, 1, 0, 0, 1 ] );

	// AF: column 0 has AF[0,0]=10 (dominant), AF[1,0]=0.1, AF[2,0]=0.1

	//     Column 1 has AF[1,1]=0.5, AF[2,1]=0.1
	var AF = new Float64Array( [ 10, 0.1, 0.1, 0, 0.5, 0.1, 0, 0, 1 ] );
	var IPIV = new Int32Array( [ -2, -2, 2 ] ); // 2x2 at k=0,1; 1x1 at k=2 (kp=2 0-based)
	var WORK = new Float64Array( 6 );
	var rpvgrw = dla_syrpvgrw.ndarray( 'lower', N, 0, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, WORK, 1, 0 );

	// WORK[0] should end up at 10 (AF[0,0] dominates).
	approxEqual( WORK[ 0 ], 10.0, 1e-12, 'WORK[0]' );

	// rpvgrw = min(amax/umax) over columns. Col 0: A_max=1, AF_max=10 → 0.1.
	approxEqual( rpvgrw, 0.1, 1e-12, 'rpvgrw' );
});

test( 'ndarray rpvgrw < 1 when factor grows (lower)', function t() {
	// Engineer a case where AF column has element larger than A column.
	var N = 2;
	var A = new Float64Array( [ 1, 0, 0, 1 ] );
	var AF = new Float64Array( [ 10, 0, 0, 1 ] );
	var IPIV = new Int32Array( [ 0, 1 ] );
	var WORK = new Float64Array( 4 );
	var rpvgrw = dla_syrpvgrw.ndarray( 'lower', N, 0, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, WORK, 1, 0 );

	// Column 0 of A: max=1; AF column 0: max=10 → 1/10=0.1.

	// Column 1 of A: max=1; AF column 1: max=1 → 1.
	approxEqual( rpvgrw, 0.1, 1e-12, 'rpvgrw' );
});
