/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zla_herpvgrw from './../lib/index.js';


// FIXTURES //

var FIXTURES_DIR = path.join( import.meta.dirname, 'fixtures' );
var FIXTURES = fs.readdirSync( FIXTURES_DIR ).filter( function f( n ) {
	return n.slice( -5 ) === '.json';
}).map( function m( n ) {
	return JSON.parse( fs.readFileSync( path.join( FIXTURES_DIR, n ), 'utf8' ) );
});


// FUNCTIONS //

function convertIPIV( ipiv ) {
	var out = new Int32Array( ipiv.length );
	var i;
	var v;
	for ( i = 0; i < ipiv.length; i++ ) {
		v = ipiv[ i ];
		if ( v > 0 ) {
			out[ i ] = v - 1;
		} else {
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
	assert.strictEqual( typeof zla_herpvgrw, 'function', 'is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zla_herpvgrw.ndarray, 'function', 'has ndarray method' );
});

test( 'ndarray throws TypeError for invalid uplo', function t() {
	assert.throws( function f() {
		zla_herpvgrw.ndarray( 'invalid', 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Int32Array( 1 ), 1, 0, new Float64Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'ndarray throws RangeError for negative N', function t() {
	assert.throws( function f() {
		zla_herpvgrw.ndarray( 'upper', -1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Int32Array( 1 ), 1, 0, new Float64Array( 2 ), 1, 0 );
	}, RangeError );
});

FIXTURES.forEach( function each( fx ) {
	test( 'ndarray fixture: ' + fx.name, function t() {
		var N = fx.N;
		var info = fx.INFO;
		var Aflat = new Float64Array( 2 * N * N );
		var AFflat = new Float64Array( 2 * N * N );
		var IPIV;
		var WORK = new Float64Array( 2 * N );
		var i;
		var rpvgrw;
		var A;
		var AF;
		if ( fx.A ) {
			for ( i = 0; i < fx.A.length; i++ ) {
				Aflat[ i ] = fx.A[ i ];
				AFflat[ i ] = fx.AF[ i ];
			}
		}
		A = new Complex128Array( Aflat.buffer );
		AF = new Complex128Array( AFflat.buffer );
		IPIV = convertIPIV( fx.IPIV );
		rpvgrw = zla_herpvgrw.ndarray( ( fx.name.indexOf( 'upper' ) >= 0 ) ? 'upper' : 'lower', N, info, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, WORK, 1, 0 );
		approxEqual( rpvgrw, fx.rpvgrw, 1e-12, 'rpvgrw' );
		if ( fx.WORK && fx.A && N > 0 ) {
			for ( i = 0; i < 2 * N; i++ ) {
				approxEqual( WORK[ i ], fx.WORK[ i ], 1e-12, 'WORK[' + i + ']' );
			}
		}
	});
});

test( 'ndarray N=0 returns 1', function t() {
	var rpvgrw = zla_herpvgrw.ndarray( 'upper', 0, 0, new Complex128Array( 0 ), 1, 1, 0, new Complex128Array( 0 ), 1, 1, 0, new Int32Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0 );
	assert.strictEqual( rpvgrw, 1.0 );
});

test( 'ndarray triggers diagonal update branch (lower 2x2 pivot, AF[k,k] dominant)', function t() {
	var N = 3;
	var Aflat = new Float64Array( 2 * N * N );
	var AFflat = new Float64Array( 2 * N * N );
	var A;
	var AF;
	var IPIV;
	var WORK;
	var rpvgrw;
	Aflat[ 0 ] = 1; Aflat[ 2 ] = 1; Aflat[ 4 ] = 1;
	Aflat[ 8 ] = 1; Aflat[ 10 ] = 1;
	Aflat[ 16 ] = 1;
	AFflat[ 0 ] = 10; AFflat[ 2 ] = 0.1; AFflat[ 4 ] = 0.1;
	AFflat[ 8 ] = 0.5; AFflat[ 10 ] = 0.1;
	AFflat[ 16 ] = 1;
	A = new Complex128Array( Aflat.buffer );
	AF = new Complex128Array( AFflat.buffer );
	IPIV = new Int32Array( [ -2, -2, 2 ] );
	WORK = new Float64Array( 6 );
	rpvgrw = zla_herpvgrw.ndarray( 'lower', N, 0, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, WORK, 1, 0 );
	approxEqual( WORK[ 0 ], 10.0, 1e-12, 'WORK[0]' );
	approxEqual( rpvgrw, 0.1, 1e-12, 'rpvgrw' );
});

test( 'ndarray rpvgrw < 1 when factor grows (lower)', function t() {
	var N = 2;
	var Aflat = new Float64Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	var AFflat = new Float64Array( [ 10, 0, 0, 0, 0, 0, 1, 0 ] );
	var A = new Complex128Array( Aflat.buffer );
	var AF = new Complex128Array( AFflat.buffer );
	var IPIV = new Int32Array( [ 0, 1 ] );
	var WORK = new Float64Array( 4 );
	var rpvgrw = zla_herpvgrw.ndarray( 'lower', N, 0, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, WORK, 1, 0 );
	approxEqual( rpvgrw, 0.1, 1e-12, 'rpvgrw' );
});
