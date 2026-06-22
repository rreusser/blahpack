/* eslint-disable max-len */
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgehd2 from './../lib/ndarray.js';

import full4x4 from './fixtures/4x4_full.json' with { type: 'json' };
import full5x5 from './fixtures/5x5_full.json' with { type: 'json' };
import partial4x4 from './fixtures/4x4_partial_ilo2_ihi3.json' with { type: 'json' };
import nOne from './fixtures/n_one.json' with { type: 'json' };
import nTwo from './fixtures/n_two.json' with { type: 'json' };
import full6x6 from './fixtures/6x6_full.json' with { type: 'json' };

var fixtures = {
	'4x4_full': full4x4,
	'5x5_full': full5x5,
	'4x4_partial_ilo2_ihi3': partial4x4,
	'n_one': nOne,
	'n_two': nTwo,
	'6x6_full': full6x6
};
function assertArrayClose( actual, expected, tol, msg ) {
	var diff, i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		diff = Math.abs( actual[ i ] - expected[ i ] );
		if ( diff > tol && diff / Math.max( Math.abs( expected[ i ] ), 1.0 ) > tol ) {
			assert.fail( msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] + ' (diff=' + diff + ')' );
		}
	}
}
function runTest( name, N, ilo, ihi, inputA ) {
	var tc = fixtures[ name ];
	var A = new Complex128Array( N * N );
	var av = reinterpret( A, 0 ); av.set( inputA );
	var TAU = new Complex128Array( Math.max( 1, N - 1 ) );
	var WORK = new Complex128Array( N );
	var info = zgehd2( N, ilo, ihi, A, 1, N, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( av, new Float64Array( tc.A ), 1e-13, 'A' );
	if ( tc.TAU ) {
		var tv = reinterpret( TAU, 0 );
		var tauSlice = new Float64Array( tc.TAU.length );
		for ( var i = 0; i < tc.TAU.length; i++ ) { tauSlice[ i ] = tv[ i ]; }
		assertArrayClose( tauSlice, new Float64Array( tc.TAU ), 1e-13, 'TAU' );
	}
}
test( 'zgehd2: 4x4_full', function () { runTest( '4x4_full', 4, 1, 4, new Float64Array([ 1,0.5, 5,-0.5, 9,1, 13,-1, 2,-1, 6,1, 10,0, 14,2, 3,0, 7,-2, 11,1, 15,0.5, 4,1, 8,0, 12,-1, 16,0 ]) ); });
test( 'zgehd2: 5x5_full', function () { runTest( '5x5_full', 5, 1, 5, new Float64Array([ 2,1, 1,0.5, 3,-1, 1,0, 4,1, 1,-0.5, 4,0, 1,1, 2,-0.5, 1,0, 3,0, 1,-1, 5,0.5, 1,0, 2,1, 1,1, 2,0, 1,-0.5, 6,1, 1,0.5, 4,-1, 1,0.5, 2,0, 1,-1, 7,0 ]) ); });
test( 'zgehd2: 4x4_partial', function () { runTest( '4x4_partial_ilo2_ihi3', 4, 2, 3, new Float64Array([ 1,0, 0,0, 0,0, 0,0, 2,0, 5,1, 8,-0.5, 0,0, 3,0, 6,-1, 9,0, 0,0, 4,0, 7,0, 10,1, 11,0 ]) ); });
test( 'zgehd2: n_one', function () {
	var tc = nOne; var A = new Complex128Array( 1 ); var av = reinterpret( A, 0 );
	av[ 0 ] = 42.0; av[ 1 ] = 3.0;
	var TAU = new Complex128Array( 1 ); var WORK = new Complex128Array( 1 );
	var info = zgehd2( 1, 1, 1, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO ); assertArrayClose( av, new Float64Array( tc.A ), 1e-14, 'A' );
});
test( 'zgehd2: n_two', function () { runTest( 'n_two', 2, 1, 2, new Float64Array([ 3,1, 4,-2, 1,-1, 2,0.5 ]) ); });
test( 'zgehd2: 6x6_full', function () { runTest( '6x6_full', 6, 1, 6, new Float64Array([ 1,0, 7,1, 13,-1, 19,0, 25,0.5, 31,-1, 2,1, 8,0, 14,0.5, 20,-1, 26,0, 32,1, 3,-1, 9,0, 15,0, 21,1, 27,-0.5, 33,0, 4,0.5, 10,-1, 16,0, 22,0, 28,1, 34,-0.5, 5,0, 11,1, 17,-1, 23,0, 29,0, 35,0.5, 6,-0.5, 12,0, 18,0.5, 24,-1, 30,0, 36,0 ]) ); });
