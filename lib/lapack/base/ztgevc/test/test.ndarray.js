// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztgevc from './../lib/ndarray.js';

// FIXTURES //

import right_all from './fixtures/right_all.json' with { type: 'json' };
import left_all from './fixtures/left_all.json' with { type: 'json' };
import both_all from './fixtures/both_all.json' with { type: 'json' };
import right_selected from './fixtures/right_selected.json' with { type: 'json' };
import right_backtransform from './fixtures/right_backtransform.json' with { type: 'json' };
import both_2x2 from './fixtures/both_2x2.json' with { type: 'json' };

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

function extractRaw( C, count ) {
	var Cv = reinterpret( C, 0 );
	var result = [];
	var i;
	for ( i = 0; i < count; i++ ) {
		result.push( Cv[ i ] );
	}
	return result;
}

/**
* Set up the 3x3 upper triangular S and P matrices.
*/
function setup3x3() {
	var LDS = 4;
	var S = new Complex128Array( LDS * 4 );
	var P = new Complex128Array( LDS * 4 );
	var Sv = reinterpret( S, 0 );
	var Pv = reinterpret( P, 0 );
	// S(0,0)=(2,1), S(0,1)=(1,0.5), S(0,2)=(0.5,0)
	// S(1,1)=(3,-1), S(1,2)=(0,1)
	// S(2,2)=(1,2)
	Sv[ 2 * ( 0 + 0 * LDS ) ] = 2; Sv[ 2 * ( 0 + 0 * LDS ) + 1 ] = 1;
	Sv[ 2 * ( 0 + 1 * LDS ) ] = 1; Sv[ 2 * ( 0 + 1 * LDS ) + 1 ] = 0.5;
	Sv[ 2 * ( 0 + 2 * LDS ) ] = 0.5; Sv[ 2 * ( 0 + 2 * LDS ) + 1 ] = 0;
	Sv[ 2 * ( 1 + 1 * LDS ) ] = 3; Sv[ 2 * ( 1 + 1 * LDS ) + 1 ] = -1;
	Sv[ 2 * ( 1 + 2 * LDS ) ] = 0; Sv[ 2 * ( 1 + 2 * LDS ) + 1 ] = 1;
	Sv[ 2 * ( 2 + 2 * LDS ) ] = 1; Sv[ 2 * ( 2 + 2 * LDS ) + 1 ] = 2;
	// P(0,0)=(1,0), P(0,1)=(0.5,0), P(0,2)=(0,0)
	// P(1,1)=(2,0), P(1,2)=(0.25,0)
	// P(2,2)=(1.5,0)
	Pv[ 2 * ( 0 + 0 * LDS ) ] = 1; Pv[ 2 * ( 0 + 0 * LDS ) + 1 ] = 0;
	Pv[ 2 * ( 0 + 1 * LDS ) ] = 0.5; Pv[ 2 * ( 0 + 1 * LDS ) + 1 ] = 0;
	Pv[ 2 * ( 0 + 2 * LDS ) ] = 0; Pv[ 2 * ( 0 + 2 * LDS ) + 1 ] = 0;
	Pv[ 2 * ( 1 + 1 * LDS ) ] = 2; Pv[ 2 * ( 1 + 1 * LDS ) + 1 ] = 0;
	Pv[ 2 * ( 1 + 2 * LDS ) ] = 0.25; Pv[ 2 * ( 1 + 2 * LDS ) + 1 ] = 0;
	Pv[ 2 * ( 2 + 2 * LDS ) ] = 1.5; Pv[ 2 * ( 2 + 2 * LDS ) + 1 ] = 0;
	return { S: S, P: P, LDS: LDS };
}

function setup2x2() {
	var LDS = 4;
	var S = new Complex128Array( LDS * 4 );
	var P = new Complex128Array( LDS * 4 );
	var Sv = reinterpret( S, 0 );
	var Pv = reinterpret( P, 0 );
	Sv[ 2 * ( 0 + 0 * LDS ) ] = 1; Sv[ 2 * ( 0 + 0 * LDS ) + 1 ] = 0;
	Sv[ 2 * ( 0 + 1 * LDS ) ] = 0.5; Sv[ 2 * ( 0 + 1 * LDS ) + 1 ] = 0.5;
	Sv[ 2 * ( 1 + 1 * LDS ) ] = 2; Sv[ 2 * ( 1 + 1 * LDS ) + 1 ] = 0;
	Pv[ 2 * ( 0 + 0 * LDS ) ] = 1; Pv[ 2 * ( 0 + 0 * LDS ) + 1 ] = 0;
	Pv[ 2 * ( 1 + 1 * LDS ) ] = 1; Pv[ 2 * ( 1 + 1 * LDS ) + 1 ] = 0;
	return { S: S, P: P, LDS: LDS };
}

// TESTS //

test( 'ztgevc: right eigenvectors, all (SIDE=R, HOWMNY=A)', function t() {
	var tc = right_all;
	var sp = setup3x3();
	var VL = new Complex128Array( sp.LDS * 4 );
	var VR = new Complex128Array( sp.LDS * 4 );
	var WORK = new Complex128Array( 20 );
	var RWORK = new Float64Array( 20 );
	var SELECT = [ false, false, false ];
	var M = [ 0 ];
	var info = ztgevc( 'right', 'all', SELECT, 1, 0, 3, sp.S, 1, sp.LDS, 0, sp.P, 1, sp.LDS, 0, VL, 1, sp.LDS, 0, VR, 1, sp.LDS, 0, 3, M, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( M[ 0 ], tc.m );
	assertArrayClose( extractRaw( VR, tc.vr.length ), tc.vr, 1e-12, 'vr' );
});

test( 'ztgevc: left eigenvectors, all (SIDE=L, HOWMNY=A)', function t() {
	var tc = left_all;
	var sp = setup3x3();
	var VL = new Complex128Array( sp.LDS * 4 );
	var VR = new Complex128Array( sp.LDS * 4 );
	var WORK = new Complex128Array( 20 );
	var RWORK = new Float64Array( 20 );
	var SELECT = [ false, false, false ];
	var M = [ 0 ];
	var info = ztgevc( 'left', 'all', SELECT, 1, 0, 3, sp.S, 1, sp.LDS, 0, sp.P, 1, sp.LDS, 0, VL, 1, sp.LDS, 0, VR, 1, sp.LDS, 0, 3, M, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( M[ 0 ], tc.m );
	assertArrayClose( extractRaw( VL, tc.vl.length ), tc.vl, 1e-12, 'vl' );
});

test( 'ztgevc: both eigenvectors, all (SIDE=B, HOWMNY=A)', function t() {
	var tc = both_all;
	var sp = setup3x3();
	var VL = new Complex128Array( sp.LDS * 4 );
	var VR = new Complex128Array( sp.LDS * 4 );
	var WORK = new Complex128Array( 20 );
	var RWORK = new Float64Array( 20 );
	var SELECT = [ false, false, false ];
	var M = [ 0 ];
	var info = ztgevc( 'both', 'all', SELECT, 1, 0, 3, sp.S, 1, sp.LDS, 0, sp.P, 1, sp.LDS, 0, VL, 1, sp.LDS, 0, VR, 1, sp.LDS, 0, 3, M, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( M[ 0 ], tc.m );
	assertArrayClose( extractRaw( VL, tc.vl.length ), tc.vl, 1e-12, 'vl' );
	assertArrayClose( extractRaw( VR, tc.vr.length ), tc.vr, 1e-12, 'vr' );
});

test( 'ztgevc: selected right eigenvectors (HOWMNY=S)', function t() {
	var tc = right_selected;
	var sp = setup3x3();
	var VL = new Complex128Array( sp.LDS * 4 );
	var VR = new Complex128Array( sp.LDS * 4 );
	var WORK = new Complex128Array( 20 );
	var RWORK = new Float64Array( 20 );
	var SELECT = [ true, false, true ];
	var M = [ 0 ];
	var info = ztgevc( 'right', 'selected', SELECT, 1, 0, 3, sp.S, 1, sp.LDS, 0, sp.P, 1, sp.LDS, 0, VL, 1, sp.LDS, 0, VR, 1, sp.LDS, 0, 2, M, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( M[ 0 ], tc.m );
	assertArrayClose( extractRaw( VR, tc.vr.length ), tc.vr, 1e-12, 'vr' );
});

test( 'ztgevc: right backtransform (HOWMNY=B)', function t() {
	var tc = right_backtransform;
	var sp = setup3x3();
	var VL = new Complex128Array( sp.LDS * 4 );
	var VR = new Complex128Array( sp.LDS * 4 );
	var VRv = reinterpret( VR, 0 );
	var i;
	// Set VR = identity
	for ( i = 0; i < 3; i++ ) {
		VRv[ 2 * ( i + i * sp.LDS ) ] = 1.0;
	}
	var WORK = new Complex128Array( 20 );
	var RWORK = new Float64Array( 20 );
	var SELECT = [ false, false, false ];
	var M = [ 0 ];
	var info = ztgevc( 'right', 'backtransform', SELECT, 1, 0, 3, sp.S, 1, sp.LDS, 0, sp.P, 1, sp.LDS, 0, VL, 1, sp.LDS, 0, VR, 1, sp.LDS, 0, 3, M, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( M[ 0 ], tc.m );
	assertArrayClose( extractRaw( VR, tc.vr.length ), tc.vr, 1e-12, 'vr' );
});

test( 'ztgevc: N=0 quick return', function t() {
	var S = new Complex128Array( 1 );
	var P = new Complex128Array( 1 );
	var VL = new Complex128Array( 1 );
	var VR = new Complex128Array( 1 );
	var WORK = new Complex128Array( 1 );
	var RWORK = new Float64Array( 1 );
	var SELECT = [];
	var M = [ 0 ];
	var info = ztgevc( 'right', 'all', SELECT, 1, 0, 0, S, 1, 1, 0, P, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, 0, M, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( info, 0 );
	assert.equal( M[ 0 ], 0 );
});

test( 'ztgevc: 2x2 system, both', function t() {
	var tc = both_2x2;
	var sp = setup2x2();
	var VL = new Complex128Array( sp.LDS * 4 );
	var VR = new Complex128Array( sp.LDS * 4 );
	var WORK = new Complex128Array( 20 );
	var RWORK = new Float64Array( 20 );
	var SELECT = [ false, false ];
	var M = [ 0 ];
	var info = ztgevc( 'both', 'all', SELECT, 1, 0, 2, sp.S, 1, sp.LDS, 0, sp.P, 1, sp.LDS, 0, VL, 1, sp.LDS, 0, VR, 1, sp.LDS, 0, 2, M, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( M[ 0 ], tc.m );
	assertArrayClose( extractRaw( VL, tc.vl.length ), tc.vl, 1e-12, 'vl' );
	assertArrayClose( extractRaw( VR, tc.vr.length ), tc.vr, 1e-12, 'vr' );
});
