/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zla_syrpvgrw from './../lib/index.js';


// FIXTURES //

const FIXTURES_DIR = path.join( import.meta.dirname, 'fixtures' );
const FIXTURES = fs.readdirSync( FIXTURES_DIR ).filter( function f( n ) {
	return n.slice( -5 ) === '.json';
}).map( function m( n ) {
	return JSON.parse( fs.readFileSync( path.join( FIXTURES_DIR, n ), 'utf8' ) );
});


// FUNCTIONS //

function convertIPIV( ipiv ) {
	const out = new Int32Array( ipiv.length );
	let i, v;
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
	const abs = Math.abs( actual - expected );
	const ref = Math.max( Math.abs( expected ), 1.0 );
	assert.ok( abs <= tol * ref, msg + ' got=' + actual + ' expected=' + expected );
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zla_syrpvgrw, 'function', 'is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zla_syrpvgrw.ndarray, 'function', 'has ndarray method' );
});

test( 'ndarray throws TypeError for invalid uplo', function t() {
	assert.throws( function f() {
		zla_syrpvgrw.ndarray( 'invalid', 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Int32Array( 1 ), 1, 0, new Float64Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'ndarray throws RangeError for negative N', function t() {
	assert.throws( function f() {
		zla_syrpvgrw.ndarray( 'upper', -1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Int32Array( 1 ), 1, 0, new Float64Array( 2 ), 1, 0 );
	}, RangeError );
});

FIXTURES.forEach( function each( fx ) {
	test( 'ndarray fixture: ' + fx.name, function t() {
		const N = fx.N;
		const info = fx.INFO;
		const Aflat = new Float64Array( 2 * N * N );
		const AFflat = new Float64Array( 2 * N * N );
		const WORK = new Float64Array( 2 * N );
		let i;
		if ( fx.A ) {
			for ( i = 0; i < fx.A.length; i++ ) {
				Aflat[ i ] = fx.A[ i ];
				AFflat[ i ] = fx.AF[ i ];
			}
		}
		const A = new Complex128Array( Aflat.buffer );
		const AF = new Complex128Array( AFflat.buffer );
		const IPIV = convertIPIV( fx.IPIV );
		const rpvgrw = zla_syrpvgrw.ndarray( ( fx.name.indexOf( 'upper' ) >= 0 ) ? 'upper' : 'lower', N, info, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, WORK, 1, 0 );
		approxEqual( rpvgrw, fx.rpvgrw, 1e-12, 'rpvgrw' );
		if ( fx.WORK && fx.A && N > 0 ) {
			for ( i = 0; i < 2 * N; i++ ) {
				approxEqual( WORK[ i ], fx.WORK[ i ], 1e-12, 'WORK[' + i + ']' );
			}
		}
	});
});

test( 'ndarray N=0 returns 1', function t() {
	const rpvgrw = zla_syrpvgrw.ndarray( 'upper', 0, 0, new Complex128Array( 0 ), 1, 1, 0, new Complex128Array( 0 ), 1, 1, 0, new Int32Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0 );
	assert.strictEqual( rpvgrw, 1.0 );
});

test( 'ndarray triggers diagonal update branch (lower 2x2 pivot, AF[k,k] dominant)', function t() {
	const N = 3;
	const Aflat = new Float64Array( 2 * N * N );
	const AFflat = new Float64Array( 2 * N * N );

	// Column 0: A[0,0]=1, A[1,0]=1, A[2,0]=1
	Aflat[ 0 ] = 1; Aflat[ 2 ] = 1; Aflat[ 4 ] = 1;
	Aflat[ 8 ] = 1; Aflat[ 10 ] = 1;
	Aflat[ 16 ] = 1;

	// AF column 0: AF[0,0]=10, AF[1,0]=0.1, AF[2,0]=0.1
	AFflat[ 0 ] = 10; AFflat[ 2 ] = 0.1; AFflat[ 4 ] = 0.1;
	AFflat[ 8 ] = 0.5; AFflat[ 10 ] = 0.1;
	AFflat[ 16 ] = 1;
	const A = new Complex128Array( Aflat.buffer );
	const AF = new Complex128Array( AFflat.buffer );
	const IPIV = new Int32Array( [ -2, -2, 2 ] );
	const WORK = new Float64Array( 6 );
	const rpvgrw = zla_syrpvgrw.ndarray( 'lower', N, 0, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, WORK, 1, 0 );
	approxEqual( WORK[ 0 ], 10.0, 1e-12, 'WORK[0]' );
	approxEqual( rpvgrw, 0.1, 1e-12, 'rpvgrw' );
});

test( 'ndarray exercises INFO > 0 (singular) path', function t() {
	// INFO=2 with N=3: ncols=info=2.
	const N = 3;
	const Aflat = new Float64Array( 2 * N * N );
	const AFflat = new Float64Array( 2 * N * N );
	Aflat[ 0 ] = 4; Aflat[ 8 ] = 1; Aflat[ 16 ] = 3;
	AFflat[ 0 ] = 4; AFflat[ 8 ] = 0.5; AFflat[ 16 ] = 2;
	const A = new Complex128Array( Aflat.buffer );
	const AF = new Complex128Array( AFflat.buffer );
	const IPIV = new Int32Array( [ 0, 1, 2 ] );
	const WORK = new Float64Array( 2 * N );
	const r = zla_syrpvgrw.ndarray( 'lower', N, 2, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, WORK, 1, 0 );
	assert.ok( Number.isFinite( r ), 'r is finite' );
});

test( 'ndarray rpvgrw < 1 when factor grows (lower)', function t() {
	const N = 2;
	const Aflat = new Float64Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	const AFflat = new Float64Array( [ 10, 0, 0, 0, 0, 0, 1, 0 ] );
	const A = new Complex128Array( Aflat.buffer );
	const AF = new Complex128Array( AFflat.buffer );
	const IPIV = new Int32Array( [ 0, 1 ] );
	const WORK = new Float64Array( 4 );
	const rpvgrw = zla_syrpvgrw.ndarray( 'lower', N, 0, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, WORK, 1, 0 );
	approxEqual( rpvgrw, 0.1, 1e-12, 'rpvgrw' );
});
