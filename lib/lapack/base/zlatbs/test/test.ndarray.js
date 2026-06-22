/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements-per-line */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlatbs from './../lib/ndarray.js';

// FIXTURES //

import upper_notrans_nonunit_4x4 from './fixtures/upper_notrans_nonunit_4x4.json' with { type: 'json' };
import lower_notrans_nonunit_4x4 from './fixtures/lower_notrans_nonunit_4x4.json' with { type: 'json' };
import upper_conjtrans_nonunit_4x4 from './fixtures/upper_conjtrans_nonunit_4x4.json' with { type: 'json' };
import upper_trans_nonunit_4x4 from './fixtures/upper_trans_nonunit_4x4.json' with { type: 'json' };
import lower_notrans_unit_4x4 from './fixtures/lower_notrans_unit_4x4.json' with { type: 'json' };
import n0 from './fixtures/n0.json' with { type: 'json' };
import n1_upper from './fixtures/n1_upper.json' with { type: 'json' };
import lower_conjtrans_nonunit_4x4 from './fixtures/lower_conjtrans_nonunit_4x4.json' with { type: 'json' };
import singular_upper from './fixtures/singular_upper.json' with { type: 'json' };


// VARIABLES //

var TOL = 1e-9;


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

function allFinite( arr ) {
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		if ( !isFinite( arr[ i ] ) ) {
			return false;
		}
	}
	return true;
}

function setZ( ABv, ldab, row, col, re, im ) {
	ABv[ ((col * ldab) + row) * 2 ] = re;
	ABv[ (((col * ldab) + row) * 2) + 1 ] = im;
}


// TESTS //

test( 'zlatbs.ndarray: main export is a function', function t() {
	assert.strictEqual( typeof zlatbs, 'function', 'main export is a function' );
});

test( 'zlatbs.ndarray: upper, no-transpose, non-unit (4x4 KD=2)', function t() {
	var tc = upper_notrans_nonunit_4x4;
	var n = 4;
	var kd = 2;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 2, 0, 2.0, 1.0 );
	setZ( ABv, ldab, 2, 1, 3.0, -1.0 );
	setZ( ABv, ldab, 2, 2, 4.0, 2.0 );
	setZ( ABv, ldab, 2, 3, 5.0, 0.0 );
	setZ( ABv, ldab, 1, 1, 1.0, 0.5 );
	setZ( ABv, ldab, 1, 2, 2.0, -1.0 );
	setZ( ABv, ldab, 1, 3, 1.5, 1.0 );
	setZ( ABv, ldab, 0, 2, 0.5, 0.0 );
	setZ( ABv, ldab, 0, 3, 0.3, 0.2 );
	var x = new Complex128Array([ 1.0, 0.0, 2.0, 1.0, -1.0, 3.0, 0.5, -0.5 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'upper', 'no-transpose', 'non-unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.X, TOL, 'X' );
	assertArrayClose( Array.from( CNORM ), tc.cnorm, TOL, 'cnorm' );
});

test( 'zlatbs.ndarray: lower, no-transpose, non-unit (4x4 KD=2)', function t() {
	var tc = lower_notrans_nonunit_4x4;
	var n = 4;
	var kd = 2;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 0, 0, 3.0, 0.0 );
	setZ( ABv, ldab, 0, 1, 4.0, 1.0 );
	setZ( ABv, ldab, 0, 2, 2.0, -1.0 );
	setZ( ABv, ldab, 0, 3, 5.0, 2.0 );
	setZ( ABv, ldab, 1, 0, 1.0, 1.0 );
	setZ( ABv, ldab, 1, 1, 0.5, -0.5 );
	setZ( ABv, ldab, 1, 2, 2.0, 0.0 );
	setZ( ABv, ldab, 2, 0, 0.2, 0.1 );
	setZ( ABv, ldab, 2, 1, 0.3, -0.2 );
	var x = new Complex128Array([ 1.0, 0.0, 0.0, 1.0, 2.0, -1.0, -1.0, 0.5 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'lower', 'no-transpose', 'non-unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.X, TOL, 'X' );
	assertArrayClose( Array.from( CNORM ), tc.cnorm, TOL, 'cnorm' );
});

test( 'zlatbs.ndarray: upper, conjugate-transpose, non-unit (4x4 KD=2)', function t() {
	var tc = upper_conjtrans_nonunit_4x4;
	var n = 4;
	var kd = 2;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 2, 0, 2.0, 1.0 );
	setZ( ABv, ldab, 2, 1, 3.0, -1.0 );
	setZ( ABv, ldab, 2, 2, 4.0, 2.0 );
	setZ( ABv, ldab, 2, 3, 5.0, 0.0 );
	setZ( ABv, ldab, 1, 1, 1.0, 0.5 );
	setZ( ABv, ldab, 1, 2, 2.0, -1.0 );
	setZ( ABv, ldab, 1, 3, 1.5, 1.0 );
	setZ( ABv, ldab, 0, 2, 0.5, 0.0 );
	setZ( ABv, ldab, 0, 3, 0.3, 0.2 );
	var x = new Complex128Array([ 1.0, 2.0, -1.0, 1.0, 0.5, -0.5, 3.0, 0.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'upper', 'conjugate-transpose', 'non-unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.X, TOL, 'X' );
	assertArrayClose( Array.from( CNORM ), tc.cnorm, TOL, 'cnorm' );
});

test( 'zlatbs.ndarray: upper, transpose, non-unit (4x4 KD=2)', function t() {
	var tc = upper_trans_nonunit_4x4;
	var n = 4;
	var kd = 2;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 2, 0, 2.0, 1.0 );
	setZ( ABv, ldab, 2, 1, 3.0, -1.0 );
	setZ( ABv, ldab, 2, 2, 4.0, 2.0 );
	setZ( ABv, ldab, 2, 3, 5.0, 0.0 );
	setZ( ABv, ldab, 1, 1, 1.0, 0.5 );
	setZ( ABv, ldab, 1, 2, 2.0, -1.0 );
	setZ( ABv, ldab, 1, 3, 1.5, 1.0 );
	setZ( ABv, ldab, 0, 2, 0.5, 0.0 );
	setZ( ABv, ldab, 0, 3, 0.3, 0.2 );
	var x = new Complex128Array([ 1.0, 2.0, -1.0, 1.0, 0.5, -0.5, 3.0, 0.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'upper', 'transpose', 'non-unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.X, TOL, 'X' );
	assertArrayClose( Array.from( CNORM ), tc.cnorm, TOL, 'cnorm' );
});

test( 'zlatbs.ndarray: lower, no-transpose, unit (4x4 KD=2)', function t() {
	var tc = lower_notrans_unit_4x4;
	var n = 4;
	var kd = 2;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 0, 0, 999.0, 999.0 );
	setZ( ABv, ldab, 0, 1, 999.0, 999.0 );
	setZ( ABv, ldab, 0, 2, 999.0, 999.0 );
	setZ( ABv, ldab, 0, 3, 999.0, 999.0 );
	setZ( ABv, ldab, 1, 0, 0.5, 0.5 );
	setZ( ABv, ldab, 1, 1, 1.0, -1.0 );
	setZ( ABv, ldab, 1, 2, -0.5, 0.25 );
	var x = new Complex128Array([ 1.0, 0.0, 2.0, 1.0, -1.0, 2.0, 0.5, -0.5 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'lower', 'no-transpose', 'unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.X, TOL, 'X' );
});

test( 'zlatbs.ndarray: lower, conjugate-transpose, non-unit (4x4 KD=2)', function t() {
	var tc = lower_conjtrans_nonunit_4x4;
	var n = 4;
	var kd = 2;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 0, 0, 3.0, 0.0 );
	setZ( ABv, ldab, 0, 1, 4.0, 1.0 );
	setZ( ABv, ldab, 0, 2, 2.0, -1.0 );
	setZ( ABv, ldab, 0, 3, 5.0, 2.0 );
	setZ( ABv, ldab, 1, 0, 1.0, 1.0 );
	setZ( ABv, ldab, 1, 1, 0.5, -0.5 );
	setZ( ABv, ldab, 1, 2, 2.0, 0.0 );
	setZ( ABv, ldab, 2, 0, 0.2, 0.1 );
	setZ( ABv, ldab, 2, 1, 0.3, -0.2 );
	var x = new Complex128Array([ 1.0, -1.0, 2.0, 0.0, 0.0, 3.0, -1.0, 1.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'lower', 'conjugate-transpose', 'non-unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.X, TOL, 'X' );
});

test( 'zlatbs.ndarray: N=0 quick return', function t() {
	var tc = n0;
	var AB = new Complex128Array( 1 );
	var x = new Complex128Array( 1 );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 1 );
	var info = zlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 0, 0, AB, 1, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zlatbs.ndarray: N=1 upper', function t() {
	var tc = n1_upper;
	var n = 1;
	var kd = 2;
	var AB = new Complex128Array( 3 );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 2, 0, 3.0, 4.0 );
	var x = new Complex128Array([ 5.0, -2.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 1 );
	var info = zlatbs( 'upper', 'no-transpose', 'non-unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.X, TOL, 'X' );
});

test( 'zlatbs.ndarray: singular upper (zero diagonal entry)', function t() {
	var tc = singular_upper;
	var n = 3;
	var kd = 2;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 2, 0, 2.0, 0.0 );
	setZ( ABv, ldab, 2, 1, 0.0, 0.0 );
	setZ( ABv, ldab, 2, 2, 3.0, 1.0 );
	setZ( ABv, ldab, 1, 1, 1.0, -1.0 );
	setZ( ABv, ldab, 1, 2, 0.5, 0.5 );
	var x = new Complex128Array([ 1.0, 0.0, 2.0, 1.0, -1.0, 0.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'upper', 'no-transpose', 'non-unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
});


// EDGE CASES: KD=0, N=2 //

test( 'zlatbs.ndarray: KD=0 upper no-transpose nonunit (purely diagonal)', function t() {
	var n = 3;
	var kd = 0;
	var AB = new Complex128Array( n );
	var ABv = reinterpret( AB, 0 );
	setZ( ABv, 1, 0, 0, 2.0, 0.0 );
	setZ( ABv, 1, 0, 1, 1.0, 1.0 );
	setZ( ABv, 1, 0, 2, 3.0, -1.0 );
	var x = new Complex128Array([ 4.0, 0.0, 2.0, 2.0, 9.0, 3.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'upper', 'no-transpose', 'non-unit', 'no', n, kd, AB, 1, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, 0 );
	assert.ok( allFinite( reinterpret( x, 0 ) ), 'x finite' );
});

test( 'zlatbs.ndarray: KD=0 lower transpose unit', function t() {
	var n = 2;
	var kd = 0;
	var AB = new Complex128Array( n );
	var ABv = reinterpret( AB, 0 );
	setZ( ABv, 1, 0, 0, 99.0, 99.0 );
	setZ( ABv, 1, 0, 1, 99.0, 99.0 );
	var x = new Complex128Array([ 1.0, 2.0, 3.0, 4.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'lower', 'transpose', 'unit', 'no', n, kd, AB, 1, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, 0 );
	assert.equal( scale[ 0 ], 1.0, 'scale=1 (no division)' );
});


// EDGE CASES: KD=N-1 (full band) //

test( 'zlatbs.ndarray: KD=N-1=2 upper full band 3x3', function t() {
	var n = 3;
	var kd = 2;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 2, 0, 2.0, 0.5 );
	setZ( ABv, ldab, 1, 1, 0.5, 0.0 );
	setZ( ABv, ldab, 2, 1, 3.0, -1.0 );
	setZ( ABv, ldab, 0, 2, 0.25, 0.25 );
	setZ( ABv, ldab, 1, 2, 0.5, -0.5 );
	setZ( ABv, ldab, 2, 2, 4.0, 1.0 );
	var x = new Complex128Array([ 4.0, 1.0, 9.0, -2.0, 16.0, 3.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'upper', 'no-transpose', 'non-unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, 0 );
	assert.ok( allFinite( reinterpret( x, 0 ) ), 'x finite' );
});


// CAREFUL OVERFLOW PATHS //

test( 'zlatbs.ndarray: careful path tiny diagonal upper N nonunit', function t() {
	var n = 3;
	var kd = 2;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 2, 0, 1e-300, 0.0 );
	setZ( ABv, ldab, 1, 1, 1.0, 0.0 );
	setZ( ABv, ldab, 2, 1, 1e-300, 0.0 );
	setZ( ABv, ldab, 0, 2, 0.5, 0.0 );
	setZ( ABv, ldab, 1, 2, 1.0, 0.0 );
	setZ( ABv, ldab, 2, 2, 1e-300, 0.0 );
	var x = new Complex128Array([ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'upper', 'no-transpose', 'non-unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, 0 );
	assert.ok( allFinite( reinterpret( x, 0 ) ), 'x finite' );
});

test( 'zlatbs.ndarray: careful path tiny diagonal upper transpose (non-conjugate)', function t() {
	var n = 3;
	var kd = 2;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 2, 0, 1e-300, 0.0 );
	setZ( ABv, ldab, 1, 1, 1.0, 0.5 );
	setZ( ABv, ldab, 2, 1, 1e-300, 0.0 );
	setZ( ABv, ldab, 0, 2, 0.5, 0.0 );
	setZ( ABv, ldab, 1, 2, 1.0, -0.5 );
	setZ( ABv, ldab, 2, 2, 1e-300, 0.0 );
	var x = new Complex128Array([ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'upper', 'transpose', 'non-unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, 0 );
	assert.ok( allFinite( reinterpret( x, 0 ) ), 'x finite' );
});

test( 'zlatbs.ndarray: careful path tiny diagonal lower transpose (non-conjugate)', function t() {
	var n = 3;
	var kd = 2;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 0, 0, 1e-300, 0.0 );
	setZ( ABv, ldab, 1, 0, 1.0, 0.5 );
	setZ( ABv, ldab, 2, 0, 0.5, 0.0 );
	setZ( ABv, ldab, 0, 1, 1e-300, 0.0 );
	setZ( ABv, ldab, 1, 1, 1.0, -0.5 );
	setZ( ABv, ldab, 0, 2, 1e-300, 0.0 );
	var x = new Complex128Array([ 1.0, -1.0, 2.0, 0.5, 3.0, 0.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'lower', 'transpose', 'non-unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, 0 );
	assert.ok( allFinite( reinterpret( x, 0 ) ), 'x finite' );
});

test( 'zlatbs.ndarray: zero diagonal in transpose careful path forces e_j', function t() {
	var n = 2;
	var kd = 1;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 1, 0, 1.0, 0.5 );
	setZ( ABv, ldab, 0, 1, 1.0, 0.0 );
	setZ( ABv, ldab, 1, 1, 0.0, 0.0 );
	var x = new Complex128Array([ 2.0, 0.0, 3.0, 0.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'upper', 'transpose', 'non-unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, 0 );
	assert.equal( scale[ 0 ], 0.0, 'scale=0 for singular' );
});

test( 'zlatbs.ndarray: unit lower transpose careful path huge off-diagonal', function t() {
	var n = 3;
	var kd = 2;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 0, 0, 99.0, 0.0 );
	setZ( ABv, ldab, 1, 0, 1e150, 0.0 );
	setZ( ABv, ldab, 2, 0, 1e150, 0.0 );
	setZ( ABv, ldab, 0, 1, 99.0, 0.0 );
	setZ( ABv, ldab, 1, 1, 1e150, 0.0 );
	setZ( ABv, ldab, 0, 2, 99.0, 0.0 );
	var x = new Complex128Array([ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'lower', 'transpose', 'unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, 0 );
	assert.ok( allFinite( reinterpret( x, 0 ) ), 'x finite' );
});

test( 'zlatbs.ndarray: careful path tiny diagonal upper conjugate-transpose', function t() {
	var n = 3;
	var kd = 2;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 2, 0, 1e-300, 0.0 );
	setZ( ABv, ldab, 1, 1, 1.0, 0.0 );
	setZ( ABv, ldab, 2, 1, 1e-300, 0.0 );
	setZ( ABv, ldab, 0, 2, 0.5, 0.0 );
	setZ( ABv, ldab, 1, 2, 1.0, 0.0 );
	setZ( ABv, ldab, 2, 2, 1e-300, 0.0 );
	var x = new Complex128Array([ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'upper', 'conjugate-transpose', 'non-unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, 0 );
	assert.ok( allFinite( reinterpret( x, 0 ) ), 'x finite' );
});

test( 'zlatbs.ndarray: careful path tiny diagonal lower N nonunit', function t() {
	var n = 3;
	var kd = 2;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 0, 0, 1e-300, 0.0 );
	setZ( ABv, ldab, 1, 0, 1.0, 0.0 );
	setZ( ABv, ldab, 2, 0, 0.5, 0.0 );
	setZ( ABv, ldab, 0, 1, 1e-300, 0.0 );
	setZ( ABv, ldab, 1, 1, 1.0, 0.0 );
	setZ( ABv, ldab, 0, 2, 1e-300, 0.0 );
	var x = new Complex128Array([ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'lower', 'no-transpose', 'non-unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, 0 );
	assert.ok( allFinite( reinterpret( x, 0 ) ), 'x finite' );
});

test( 'zlatbs.ndarray: careful path tiny diagonal lower conjugate-transpose', function t() {
	var n = 3;
	var kd = 2;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 0, 0, 1e-300, 0.0 );
	setZ( ABv, ldab, 1, 0, 1.0, 0.0 );
	setZ( ABv, ldab, 2, 0, 0.5, 0.0 );
	setZ( ABv, ldab, 0, 1, 1e-300, 0.0 );
	setZ( ABv, ldab, 1, 1, 1.0, 0.0 );
	setZ( ABv, ldab, 0, 2, 1e-300, 0.0 );
	var x = new Complex128Array([ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'lower', 'conjugate-transpose', 'non-unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, 0 );
	assert.ok( allFinite( reinterpret( x, 0 ) ), 'x finite' );
});

test( 'zlatbs.ndarray: huge CNORM triggers tscal scaling', function t() {
	var n = 3;
	var kd = 2;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 2, 0, 2.0, 0.0 );
	setZ( ABv, ldab, 1, 1, 1e308, 0.0 );
	setZ( ABv, ldab, 2, 1, 3.0, 0.0 );
	setZ( ABv, ldab, 0, 2, 1e308, 0.0 );
	setZ( ABv, ldab, 1, 2, 1e308, 0.0 );
	setZ( ABv, ldab, 2, 2, 4.0, 0.0 );
	var x = new Complex128Array([ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'upper', 'no-transpose', 'non-unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, 0 );
	assert.ok( allFinite( reinterpret( x, 0 ) ), 'x finite' );
});

test( 'zlatbs.ndarray: huge initial xmax pre-scaling', function t() {
	var n = 2;
	var kd = 1;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 1, 0, 1e-300, 0.0 );
	setZ( ABv, ldab, 0, 1, 1e-300, 0.0 );
	setZ( ABv, ldab, 1, 1, 1e-300, 0.0 );
	var x = new Complex128Array([ 1e308, 0.0, 1e308, 0.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'upper', 'no-transpose', 'non-unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, 0 );
	assert.ok( allFinite( reinterpret( x, 0 ) ), 'x finite' );
});

test( 'zlatbs.ndarray: unit upper careful path huge off-diagonal', function t() {
	var n = 3;
	var kd = 2;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 2, 0, 99.0, 0.0 );
	setZ( ABv, ldab, 1, 1, 1e150, 0.0 );
	setZ( ABv, ldab, 2, 1, 99.0, 0.0 );
	setZ( ABv, ldab, 0, 2, 1e150, 0.0 );
	setZ( ABv, ldab, 1, 2, 1e150, 0.0 );
	setZ( ABv, ldab, 2, 2, 99.0, 0.0 );
	var x = new Complex128Array([ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'upper', 'no-transpose', 'unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, 0 );
	assert.ok( allFinite( reinterpret( x, 0 ) ), 'x finite' );
});

test( 'zlatbs.ndarray: unit lower careful path huge off-diagonal', function t() {
	var n = 3;
	var kd = 2;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 0, 0, 99.0, 0.0 );
	setZ( ABv, ldab, 1, 0, 1e150, 0.0 );
	setZ( ABv, ldab, 2, 0, 1e150, 0.0 );
	setZ( ABv, ldab, 0, 1, 99.0, 0.0 );
	setZ( ABv, ldab, 1, 1, 1e150, 0.0 );
	setZ( ABv, ldab, 0, 2, 99.0, 0.0 );
	var x = new Complex128Array([ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'lower', 'no-transpose', 'unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, 0 );
	assert.ok( allFinite( reinterpret( x, 0 ) ), 'x finite' );
});

test( 'zlatbs.ndarray: unit upper transpose careful path', function t() {
	var n = 3;
	var kd = 2;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 2, 0, 99.0, 0.0 );
	setZ( ABv, ldab, 1, 1, 1e150, 0.0 );
	setZ( ABv, ldab, 2, 1, 99.0, 0.0 );
	setZ( ABv, ldab, 0, 2, 1e150, 0.0 );
	setZ( ABv, ldab, 1, 2, 1e150, 0.0 );
	setZ( ABv, ldab, 2, 2, 99.0, 0.0 );
	var x = new Complex128Array([ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'upper', 'transpose', 'unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, 0 );
	assert.ok( allFinite( reinterpret( x, 0 ) ), 'x finite' );
});

test( 'zlatbs.ndarray: zero diagonal in transpose path forces e_j', function t() {
	var n = 2;
	var kd = 1;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 1, 0, 1.0, 0.0 );
	setZ( ABv, ldab, 0, 1, 1.0, 0.0 );
	setZ( ABv, ldab, 1, 1, 0.0, 0.0 );
	var x = new Complex128Array([ 2.0, 0.0, 3.0, 0.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'upper', 'conjugate-transpose', 'non-unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, 0 );
	assert.equal( scale[ 0 ], 0.0, 'scale=0 for singular' );
});

test( 'zlatbs.ndarray: huge x careful path forces per-step rec scaling', function t() {
	var n = 3;
	var kd = 2;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 2, 0, 1e-200, 0.0 );
	setZ( ABv, ldab, 1, 1, 1.0, 0.0 );
	setZ( ABv, ldab, 2, 1, 1e-200, 0.0 );
	setZ( ABv, ldab, 0, 2, 1.0, 0.0 );
	setZ( ABv, ldab, 1, 2, 1.0, 0.0 );
	setZ( ABv, ldab, 2, 2, 1e-200, 0.0 );
	var x = new Complex128Array([ 1e150, 0.0, 1e150, 0.0, 1e150, 0.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( n );
	var info = zlatbs( 'upper', 'no-transpose', 'non-unit', 'no', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, 0 );
	assert.ok( allFinite( reinterpret( x, 0 ) ), 'x finite' );
});

test( 'zlatbs.ndarray: normin=yes path (precomputed CNORM)', function t() {
	var n = 3;
	var kd = 1;
	var AB = new Complex128Array( (kd + 1) * n );
	var ABv = reinterpret( AB, 0 );
	var ldab = kd + 1;
	setZ( ABv, ldab, 1, 0, 2.0, 0.0 );
	setZ( ABv, ldab, 0, 1, 1.0, 0.0 );
	setZ( ABv, ldab, 1, 1, 3.0, 0.0 );
	setZ( ABv, ldab, 0, 2, 1.0, 0.0 );
	setZ( ABv, ldab, 1, 2, 4.0, 0.0 );
	var x = new Complex128Array([ 4.0, 0.0, 9.0, 0.0, 16.0, 0.0 ]);
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array([ 0.0, 1.0, 1.0 ]);
	var info = zlatbs( 'upper', 'no-transpose', 'non-unit', 'yes', n, kd, AB, 1, ldab, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, 0 );
	assert.ok( allFinite( reinterpret( x, 0 ) ), 'x finite' );
});


// VALIDATION ERRORS //

test( 'zlatbs.ndarray: throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlatbs( 'invalid', 'no-transpose', 'non-unit', 'no', 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0 );
	}, TypeError );
});

test( 'zlatbs.ndarray: throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zlatbs( 'upper', 'bad', 'non-unit', 'no', 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0 );
	}, TypeError );
});

test( 'zlatbs.ndarray: throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		zlatbs( 'upper', 'no-transpose', 'bad', 'no', 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0 );
	}, TypeError );
});

test( 'zlatbs.ndarray: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlatbs( 'upper', 'no-transpose', 'non-unit', 'no', -1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0 );
	}, RangeError );
});
