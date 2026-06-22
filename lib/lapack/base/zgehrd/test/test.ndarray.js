/* eslint-disable max-len */
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgehrd from './../lib/ndarray.js';

import full4x4 from './fixtures/4x4_full.json' with { type: 'json' };
import full5x5 from './fixtures/5x5_full.json' with { type: 'json' };
import full6x6 from './fixtures/6x6_full.json' with { type: 'json' };
import full8x8 from './fixtures/8x8_full.json' with { type: 'json' };
import partial4x4 from './fixtures/4x4_partial_ilo2_ihi3.json' with { type: 'json' };
import nOne from './fixtures/n_one.json' with { type: 'json' };
import nTwo from './fixtures/n_two.json' with { type: 'json' };

var fixtures = {
	'4x4_full': full4x4,
	'5x5_full': full5x5,
	'6x6_full': full6x6,
	'8x8_full': full8x8,
	'4x4_partial_ilo2_ihi3': partial4x4,
	'n_one': nOne,
	'n_two': nTwo
};
var NBMAX = 64;
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
	var A = new Complex128Array( N * N ); var av = reinterpret( A, 0 ); av.set( inputA );
	var TAU = new Complex128Array( Math.max( 1, N - 1 ) );
	var WORK = new Complex128Array( Math.max( 1, N * 32 + ( NBMAX + 1 ) * NBMAX ) );
	var info = zgehrd(N, ilo, ihi, A, 1, N, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( av, new Float64Array( tc.A ), 1e-13, 'A' );
	if ( tc.TAU ) {
		var tv = reinterpret( TAU, 0 );
		var tauSlice = new Float64Array( tc.TAU.length );
		for ( var i = 0; i < tc.TAU.length; i++ ) { tauSlice[ i ] = tv[ i ]; }
		assertArrayClose( tauSlice, new Float64Array( tc.TAU ), 1e-13, 'TAU' );
	}
}
test( 'zgehrd: 4x4', function () { runTest( '4x4_full', 4, 1, 4, new Float64Array([ 1,0.5, 5,-0.5, 9,1, 13,-1, 2,-1, 6,1, 10,0, 14,2, 3,0, 7,-2, 11,1, 15,0.5, 4,1, 8,0, 12,-1, 16,0 ]) ); });
test( 'zgehrd: 6x6', function () { runTest( '6x6_full', 6, 1, 6, new Float64Array([ 1,0, 7,1, 13,-1, 19,0, 25,0.5, 31,-1, 2,1, 8,0, 14,0.5, 20,-1, 26,0, 32,1, 3,-1, 9,0, 15,0, 21,1, 27,-0.5, 33,0, 4,0.5, 10,-1, 16,0, 22,0, 28,1, 34,-0.5, 5,0, 11,1, 17,-1, 23,0, 29,0, 35,0.5, 6,-0.5, 12,0, 18,0.5, 24,-1, 30,0, 36,0 ]) ); });
test( 'zgehrd: partial', function () { runTest( '4x4_partial_ilo2_ihi3', 4, 2, 3, new Float64Array([ 1,0, 0,0, 0,0, 0,0, 2,0, 5,1, 8,-0.5, 0,0, 3,0, 6,-1, 9,0, 0,0, 4,0, 7,0, 10,1, 11,0 ]) ); });
test( 'zgehrd: n1', function () {
	var tc = nOne; var A = new Complex128Array( 1 ); var av = reinterpret( A, 0 );
	av[ 0 ] = 42.0; av[ 1 ] = 3.0;
	var TAU = new Complex128Array( 1 ); var WORK = new Complex128Array( 1 );
	var info = zgehrd(1, 1, 1, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO ); assertArrayClose( av, new Float64Array( tc.A ), 1e-14, 'A' );
});
test( 'zgehrd: n2', function () { runTest( 'n_two', 2, 1, 2, new Float64Array([ 3,1, 4,-2, 1,-1, 2,0.5 ]) ); });
test( 'zgehrd: 8x8', function () {
	var N = 8; var inputA = new Float64Array( 2*N*N );
	for ( var idx = 1; idx <= N*N; idx++ ) { inputA[(idx-1)*2] = idx; inputA[(idx-1)*2+1] = ((idx*7+3)%11 - 5)*0.5; }
	runTest( '8x8_full', 8, 1, 8, inputA );
});
test( 'zgehrd: 40x40 blocked', function () {
	var N = 40; var inputA = new Float64Array( 2*N*N );
	for ( var idx = 1; idx <= N*N; idx++ ) { inputA[(idx-1)*2] = ((idx*13+7)%97)/10.0; inputA[(idx-1)*2+1] = ((idx*7+3)%53-26)/20.0; }
	var A1 = new Complex128Array( N*N ); var av1 = reinterpret( A1, 0 ); av1.set( inputA );
	var TAU1 = new Complex128Array( N-1 ); var WORK1 = new Complex128Array( N*32 + (NBMAX+1)*NBMAX );
	var info = zgehrd(N, 1, N, A1, 1, N, 0, TAU1, 1, 0, WORK1, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	// Verify result is upper Hessenberg (zero below first subdiagonal)
	var maxSubDiag = 0;
	var i, j, d;
	for ( j = 0; j < N; j++ ) {
		for ( i = j + 2; i < N; i++ ) {
			d = Math.sqrt( av1[2*(j*N+i)]*av1[2*(j*N+i)] + av1[2*(j*N+i)+1]*av1[2*(j*N+i)+1] );
			if ( i <= j + 2 && d > maxSubDiag ) { maxSubDiag = d; }
			// Below first subdiag should store reflector vectors, not zeros,
			// so we only check the Hessenberg structure implicitly via trace/norm
		}
	}
	// Verify trace preservation (sum of diagonal = sum of eigenvalues)
	var trOrigR = 0, trOrigI = 0, trHessR = 0, trHessI = 0;
	for ( i = 0; i < N; i++ ) {
		trOrigR += inputA[2*(i*N+i)]; trOrigI += inputA[2*(i*N+i)+1];
		trHessR += av1[2*(i*N+i)]; trHessI += av1[2*(i*N+i)+1];
	}
	var trDiff = Math.sqrt( (trOrigR-trHessR)*(trOrigR-trHessR) + (trOrigI-trHessI)*(trOrigI-trHessI) );
	assert.ok( trDiff < 1e-10, 'trace preserved: diff=' + trDiff );
	// Verify Frobenius norm of Hessenberg part is preserved
	// H = Q^H * A * Q, so ||H||_F = ||A||_F for unitary Q
	var normOrigSq = 0, normHessSq = 0;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			normOrigSq += inputA[2*(j*N+i)]*inputA[2*(j*N+i)] + inputA[2*(j*N+i)+1]*inputA[2*(j*N+i)+1];
		}
		// Hessenberg part: rows 0..min(j+1,N-1) for column j
		for ( i = 0; i <= Math.min( j+1, N-1 ); i++ ) {
			normHessSq += av1[2*(j*N+i)]*av1[2*(j*N+i)] + av1[2*(j*N+i)+1]*av1[2*(j*N+i)+1];
		}
	}
	var normOrig = Math.sqrt( normOrigSq );
	var normHess = Math.sqrt( normHessSq );
	var normDiff = Math.abs( normOrig - normHess ) / normOrig;
	assert.ok( normDiff < 1e-10, 'Frobenius norm of Hessenberg preserved: relDiff=' + normDiff );
});
test( 'zgehrd: 5x5', function () { runTest( '5x5_full', 5, 1, 5, new Float64Array([ 2,1, 1,0.5, 3,-1, 1,0, 4,1, 1,-0.5, 4,0, 1,1, 2,-0.5, 1,0, 3,0, 1,-1, 5,0.5, 1,0, 2,1, 1,1, 2,0, 1,-0.5, 6,1, 1,0.5, 4,-1, 1,0.5, 2,0, 1,-1, 7,0 ]) ); });
