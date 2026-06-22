// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqps from './../lib/ndarray.js';

// FIXTURES //

import basic_4x3_nb2 from './fixtures/basic_4x3_nb2.json' with { type: 'json' };
import rect_6x4_nb3 from './fixtures/rect_6x4_nb3.json' with { type: 'json' };
import nb_1 from './fixtures/nb_1.json' with { type: 'json' };
import collinear_norm_recomp from './fixtures/collinear_norm_recomp.json' with { type: 'json' };
import offset_1 from './fixtures/offset_1.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Compute column norms of complex matrix A(startRow:M-1, 0:N-1).
*/
function colNorms( M, N, startRow, A, LDA, offsetA ) {
	var buf = reinterpret( A, 0 );
	var vn = new Float64Array( N );
	var re;
	var im;
	var s;
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		s = 0.0;
		for ( i = startRow; i < M; i++ ) {
			re = buf[ offsetA + 2 * ( i + j * LDA ) ];
			im = buf[ offsetA + 2 * ( i + j * LDA ) + 1 ];
			s += re * re + im * im;
		}
		vn[ j ] = Math.sqrt( s );
	}
	return vn;
}

// TESTS //

test( 'zlaqps: basic 4x3 NB=2', function t() {
	var tc = basic_4x3_nb2;
	var LDA = 8;
	var LDF = 8;
	var M = 4;
	var N = 3;
	var NB = 2;
	var A = new Complex128Array( LDA * N );
	var Av = reinterpret( A, 0 );

	// A = [1+0i 0+2i 3+1i; 2+1i 1+0i 0+0i; 0+0i 3+1i 1+0i; 1+1i 2+0i 2+1i]
	Av[0]=1; Av[1]=0; Av[2]=2; Av[3]=1; Av[4]=0; Av[5]=0; Av[6]=1; Av[7]=1;
	Av[2*LDA]=0; Av[2*LDA+1]=2; Av[2*LDA+2]=1; Av[2*LDA+3]=0; Av[2*LDA+4]=3; Av[2*LDA+5]=1; Av[2*LDA+6]=2; Av[2*LDA+7]=0;
	Av[4*LDA]=3; Av[4*LDA+1]=1; Av[4*LDA+2]=0; Av[4*LDA+3]=0; Av[4*LDA+4]=1; Av[4*LDA+5]=0; Av[4*LDA+6]=2; Av[4*LDA+7]=1;

	var JPVT = new Int32Array( [ 1, 2, 3 ] );
	var TAU = new Complex128Array( N );
	var VN1 = colNorms( M, N, 0, A, LDA, 0 );
	var VN2 = new Float64Array( VN1 );
	var AUXV = new Complex128Array( NB );
	var F = new Complex128Array( LDF * N );
	var WORK = new Complex128Array( 20 );

	var kb = zlaqps( M, N, 0, NB, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, VN1, 1, 0, VN2, 1, 0, AUXV, 1, 0, F, 1, LDF, 0 );

	assert.equal( kb, tc.kb, 'kb' );
	assertArrayClose( Array.from( Av.subarray( 0, tc.a.length ) ), tc.a, 1e-10, 'a' );
	assertArrayClose( Array.from( reinterpret( TAU, 0 ).subarray( 0, tc.tau.length ) ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( Array.from( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'zlaqps: 6x4 NB=3', function t() {
	var tc = rect_6x4_nb3;
	var LDA = 8;
	var LDF = 8;
	var M = 6;
	var N = 4;
	var NB = 3;
	var A = new Complex128Array( LDA * N );
	var Av = reinterpret( A, 0 );

	Av[0]=2; Av[1]=0; Av[2]=1; Av[3]=1; Av[4]=0; Av[5]=1; Av[6]=3; Av[7]=0; Av[8]=1; Av[9]=0; Av[10]=0; Av[11]=2;
	Av[2*LDA]=1; Av[2*LDA+1]=0; Av[2*LDA+2]=0; Av[2*LDA+3]=0; Av[2*LDA+4]=2; Av[2*LDA+5]=1; Av[2*LDA+6]=1; Av[2*LDA+7]=1; Av[2*LDA+8]=0; Av[2*LDA+9]=0; Av[2*LDA+10]=3; Av[2*LDA+11]=0;
	Av[4*LDA]=0; Av[4*LDA+1]=1; Av[4*LDA+2]=3; Av[4*LDA+3]=0; Av[4*LDA+4]=1; Av[4*LDA+5]=0; Av[4*LDA+6]=0; Av[4*LDA+7]=2; Av[4*LDA+8]=2; Av[4*LDA+9]=1; Av[4*LDA+10]=1; Av[4*LDA+11]=0;
	Av[6*LDA]=1; Av[6*LDA+1]=1; Av[6*LDA+2]=2; Av[6*LDA+3]=0; Av[6*LDA+4]=0; Av[6*LDA+5]=0; Av[6*LDA+6]=1; Av[6*LDA+7]=0; Av[6*LDA+8]=3; Av[6*LDA+9]=1; Av[6*LDA+10]=0; Av[6*LDA+11]=1;

	var JPVT = new Int32Array( [ 1, 2, 3, 4 ] );
	var TAU = new Complex128Array( N );
	var VN1 = colNorms( M, N, 0, A, LDA, 0 );
	var VN2 = new Float64Array( VN1 );
	var AUXV = new Complex128Array( NB );
	var F = new Complex128Array( LDF * N );

	var kb = zlaqps( M, N, 0, NB, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, VN1, 1, 0, VN2, 1, 0, AUXV, 1, 0, F, 1, LDF, 0 );

	assert.equal( kb, tc.kb, 'kb' );
	assertArrayClose( Array.from( Av.subarray( 0, tc.a.length ) ), tc.a, 1e-10, 'a' );
	assertArrayClose( Array.from( reinterpret( TAU, 0 ).subarray( 0, tc.tau.length ) ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( Array.from( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'zlaqps: NB=1', function t() {
	var tc = nb_1;
	var LDA = 8;
	var LDF = 8;
	var M = 3;
	var N = 3;
	var NB = 1;
	var A = new Complex128Array( LDA * N );
	var Av = reinterpret( A, 0 );

	Av[0]=1; Av[1]=0; Av[2]=2; Av[3]=0; Av[4]=3; Av[5]=0;
	Av[2*LDA]=4; Av[2*LDA+1]=1; Av[2*LDA+2]=5; Av[2*LDA+3]=1; Av[2*LDA+4]=6; Av[2*LDA+5]=1;
	Av[4*LDA]=0; Av[4*LDA+1]=1; Av[4*LDA+2]=1; Av[4*LDA+3]=0; Av[4*LDA+4]=2; Av[4*LDA+5]=1;

	var JPVT = new Int32Array( [ 1, 2, 3 ] );
	var TAU = new Complex128Array( N );
	var VN1 = colNorms( M, N, 0, A, LDA, 0 );
	var VN2 = new Float64Array( VN1 );
	var AUXV = new Complex128Array( NB );
	var F = new Complex128Array( LDF * N );

	var kb = zlaqps( M, N, 0, NB, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, VN1, 1, 0, VN2, 1, 0, AUXV, 1, 0, F, 1, LDF, 0 );

	assert.equal( kb, tc.kb, 'kb' );
	assertArrayClose( Array.from( Av.subarray( 0, tc.a.length ) ), tc.a, 1e-10, 'a' );
	// Only compare first kb tau values (the rest may have residual data)
	assertArrayClose( Array.from( reinterpret( TAU, 0 ).subarray( 0, 2 * kb ) ), tc.tau.slice( 0, 2 * kb ), 1e-10, 'tau' );
	assert.deepStrictEqual( Array.from( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'zlaqps: collinear columns (norm recomputation)', function t() {
	var tc = collinear_norm_recomp;
	var LDA = 8;
	var LDF = 8;
	var M = 6;
	var N = 3;
	var NB = 2;
	var A = new Complex128Array( LDA * N );
	var Av = reinterpret( A, 0 );

	// Nearly collinear columns
	Av[0]=1; Av[1]=0; Av[2]=2; Av[3]=0; Av[4]=3; Av[5]=0; Av[6]=4; Av[7]=0; Av[8]=5; Av[9]=0; Av[10]=6; Av[11]=0;
	Av[2*LDA]=1; Av[2*LDA+1]=1e-10; Av[2*LDA+2]=2; Av[2*LDA+3]=1e-10; Av[2*LDA+4]=3; Av[2*LDA+5]=1e-10; Av[2*LDA+6]=4; Av[2*LDA+7]=1e-10; Av[2*LDA+8]=5; Av[2*LDA+9]=1e-10; Av[2*LDA+10]=6; Av[2*LDA+11]=1e-10;
	Av[4*LDA]=1; Av[4*LDA+1]=0; Av[4*LDA+2]=2; Av[4*LDA+3]=0; Av[4*LDA+4]=3; Av[4*LDA+5]=0; Av[4*LDA+6]=4; Av[4*LDA+7]=0; Av[4*LDA+8]=5; Av[4*LDA+9]=0; Av[4*LDA+10]=6.0000000001; Av[4*LDA+11]=0;

	var JPVT = new Int32Array( [ 1, 2, 3 ] );
	var TAU = new Complex128Array( N );
	var VN1 = colNorms( M, N, 0, A, LDA, 0 );
	var VN2 = new Float64Array( VN1 );
	var AUXV = new Complex128Array( NB );
	var F = new Complex128Array( LDF * N );

	var kb = zlaqps( M, N, 0, NB, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, VN1, 1, 0, VN2, 1, 0, AUXV, 1, 0, F, 1, LDF, 0 );

	assert.equal( kb, tc.kb, 'kb' );
	assert.deepStrictEqual( Array.from( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'zlaqps: offset=1', function t() {
	var tc = offset_1;
	var LDA = 8;
	var LDF = 8;
	var M = 4;
	var N = 2;
	var NB = 2;
	var A = new Complex128Array( LDA * N );
	var Av = reinterpret( A, 0 );

	Av[0]=5; Av[1]=0; Av[2]=0; Av[3]=0; Av[4]=0; Av[5]=0; Av[6]=0; Av[7]=0;
	Av[2*LDA]=1; Av[2*LDA+1]=0; Av[2*LDA+2]=2; Av[2*LDA+3]=1; Av[2*LDA+4]=1; Av[2*LDA+5]=0; Av[2*LDA+6]=3; Av[2*LDA+7]=0;

	var JPVT = new Int32Array( [ 1, 2 ] );
	var TAU = new Complex128Array( N );
	var VN1 = colNorms( M, N, 1, A, LDA, 0 );
	var VN2 = new Float64Array( VN1 );
	var AUXV = new Complex128Array( NB );
	var F = new Complex128Array( LDF * N );

	var kb = zlaqps( M, N, 1, NB, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, VN1, 1, 0, VN2, 1, 0, AUXV, 1, 0, F, 1, LDF, 0 );

	assert.equal( kb, tc.kb, 'kb' );
	assertArrayClose( Array.from( Av.subarray( 0, tc.a.length ) ), tc.a, 1e-10, 'a' );
	assertArrayClose( Array.from( reinterpret( TAU, 0 ).subarray( 0, tc.tau.length ) ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( Array.from( JPVT ), tc.jpvt, 'jpvt' );
});
