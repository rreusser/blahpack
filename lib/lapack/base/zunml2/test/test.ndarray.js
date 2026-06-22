// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgelq2 from '../../zgelq2/lib/base.js';
import zunml2 from './../lib/ndarray.js';

// FIXTURES //

import left_notrans_5x5 from './fixtures/left_notrans_5x5.json' with { type: 'json' };
import left_conjtrans_5x5 from './fixtures/left_conjtrans_5x5.json' with { type: 'json' };
import right_notrans_5x5 from './fixtures/right_notrans_5x5.json' with { type: 'json' };
import right_conjtrans_rect from './fixtures/right_conjtrans_rect.json' with { type: 'json' };

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
* Compute LQ of the 3x5 test matrix in a 6x6 container (LDA=6).
*/
function lq3x5() {
	var LDA = 6;
	var A = new Complex128Array( LDA * 6 );
	var Av = reinterpret( A, 0 );
	// Row 0: (1,0) (2,1) (0,0) (1,1) (3,0)
	Av[0]=1; Av[1]=0;
	Av[2*LDA]=2; Av[2*LDA+1]=1;
	Av[4*LDA]=0; Av[4*LDA+1]=0;
	Av[6*LDA]=1; Av[6*LDA+1]=1;
	Av[8*LDA]=3; Av[8*LDA+1]=0;
	// Row 1: (0,2) (1,0) (3,1) (2,0) (1,1)
	Av[2]=0; Av[3]=2;
	Av[2*LDA+2]=1; Av[2*LDA+3]=0;
	Av[4*LDA+2]=3; Av[4*LDA+3]=1;
	Av[6*LDA+2]=2; Av[6*LDA+3]=0;
	Av[8*LDA+2]=1; Av[8*LDA+3]=1;
	// Row 2: (3,1) (0,0) (1,0) (2,1) (0,2)
	Av[4]=3; Av[5]=1;
	Av[2*LDA+4]=0; Av[2*LDA+5]=0;
	Av[4*LDA+4]=1; Av[4*LDA+5]=0;
	Av[6*LDA+4]=2; Av[6*LDA+5]=1;
	Av[8*LDA+4]=0; Av[8*LDA+5]=2;

	var TAU = new Complex128Array( 6 );
	var WORK = new Complex128Array( 20 );
	zgelq2( 3, 5, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	return { A: A, TAU: TAU, LDA: LDA };
}

/**
* Create 5x5 identity in a 6x6 container.
*/
function eye5in6() {
	var LDC = 6;
	var C = new Complex128Array( LDC * 6 );
	var Cv = reinterpret( C, 0 );
	var i;
	for ( i = 0; i < 5; i++ ) {
		Cv[ 2 * ( i + i * LDC ) ] = 1.0;
	}
	return C;
}

function extractRaw( C, count ) {
	var Cv = reinterpret( C, 0 );
	var result = [];
	var i;
	for ( i = 0; i < count; i++ ) {
		result.push( Cv[ i ] );
	}
	return result;
}

// TESTS //

test( 'zunml2: left, no transpose (Q*I)', function t() {
	var tc = left_notrans_5x5;
	var lq = lq3x5();
	var LDC = 6;
	var C = eye5in6();
	var WORK = new Complex128Array( 200 );
	var info = zunml2( 'left', 'no-transpose', 5, 5, 3, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( C, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'zunml2: left, conjugate transpose (Q^H*I)', function t() {
	var tc = left_conjtrans_5x5;
	var lq = lq3x5();
	var LDC = 6;
	var C = eye5in6();
	var WORK = new Complex128Array( 200 );
	var info = zunml2( 'left', 'conjugate-transpose', 5, 5, 3, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( C, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'zunml2: right, no transpose (I*Q)', function t() {
	var tc = right_notrans_5x5;
	var lq = lq3x5();
	var LDC = 6;
	var C = eye5in6();
	var WORK = new Complex128Array( 200 );
	var info = zunml2( 'right', 'no-transpose', 5, 5, 3, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( C, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'zunml2: M=0 quick return', function t() {
	var lq = lq3x5();
	var C = new Complex128Array( 1 );
	var WORK = new Complex128Array( 1 );
	var info = zunml2( 'left', 'no-transpose', 0, 5, 0, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zunml2: N=0 quick return', function t() {
	var lq = lq3x5();
	var C = new Complex128Array( 1 );
	var WORK = new Complex128Array( 1 );
	var info = zunml2( 'left', 'no-transpose', 5, 0, 0, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zunml2: K=0 quick return', function t() {
	var lq = lq3x5();
	var C = new Complex128Array( 1 );
	var WORK = new Complex128Array( 1 );
	var info = zunml2( 'left', 'no-transpose', 5, 5, 0, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zunml2: right, conjugate transpose on rectangular C', function t() {
	var tc = right_conjtrans_rect;
	var lq = lq3x5();
	var LDC = 6;
	var C = new Complex128Array( LDC * 6 );
	var Cv = reinterpret( C, 0 );
	// 3x5 C matrix
	Cv[0]=1; Cv[1]=1; Cv[2]=3; Cv[3]=0; Cv[4]=-1; Cv[5]=1;
	Cv[2*LDC]=0; Cv[2*LDC+1]=2; Cv[2*LDC+2]=1; Cv[2*LDC+3]=-1; Cv[2*LDC+4]=4; Cv[2*LDC+5]=0;
	Cv[4*LDC]=2; Cv[4*LDC+1]=0; Cv[4*LDC+2]=0; Cv[4*LDC+3]=1; Cv[4*LDC+4]=1; Cv[4*LDC+5]=1;
	Cv[6*LDC]=1; Cv[6*LDC+1]=0; Cv[6*LDC+2]=2; Cv[6*LDC+3]=0; Cv[6*LDC+4]=0; Cv[6*LDC+5]=3;
	Cv[8*LDC]=0; Cv[8*LDC+1]=1; Cv[8*LDC+2]=1; Cv[8*LDC+3]=1; Cv[8*LDC+4]=2; Cv[8*LDC+5]=0;

	var WORK = new Complex128Array( 200 );
	var info = zunml2( 'right', 'conjugate-transpose', 3, 5, 3, lq.A, 1, lq.LDA, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( C, tc.c.length ), tc.c, 1e-12, 'c' );
});
