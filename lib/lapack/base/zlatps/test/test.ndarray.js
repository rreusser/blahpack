/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlatps from './../lib/ndarray.js';

import fxUpperN from './fixtures/upper_n_nonunit.json' with { type: 'json' };
import fxLowerN from './fixtures/lower_n_nonunit.json' with { type: 'json' };
import fxUpperC from './fixtures/upper_c_nonunit.json' with { type: 'json' };
import fxLowerC from './fixtures/lower_c_nonunit.json' with { type: 'json' };
import fxUpperNUnit from './fixtures/upper_n_unit.json' with { type: 'json' };
import fxLowerNUnit from './fixtures/lower_n_unit.json' with { type: 'json' };
import fxUpperCUnit from './fixtures/upper_c_unit.json' with { type: 'json' };
import fxLowerCUnit from './fixtures/lower_c_unit.json' with { type: 'json' };
import fxNZero from './fixtures/n_zero.json' with { type: 'json' };
import fxNOne from './fixtures/n_one.json' with { type: 'json' };
import fxUpperNNorminY from './fixtures/upper_n_normin_y.json' with { type: 'json' };
import fxUpperN4x4 from './fixtures/upper_n_4x4.json' with { type: 'json' };
import fxLowerC4x4 from './fixtures/lower_c_4x4.json' with { type: 'json' };
import fxLowerTUnitNorminY from './fixtures/lower_t_unit_norminy.json' with { type: 'json' };
import fxUpperNCareful from './fixtures/upper_n_careful.json' with { type: 'json' };
import fxLowerNCareful from './fixtures/lower_n_careful.json' with { type: 'json' };
import fxUpperCCareful from './fixtures/upper_c_careful.json' with { type: 'json' };
import fxLowerCCareful from './fixtures/lower_c_careful.json' with { type: 'json' };
import fxUpperNUnitCareful from './fixtures/upper_n_unit_careful.json' with { type: 'json' };


// VARIABLES //

var TOL = 1e-10;


// FUNCTIONS //

function close( got, expected, tol ) {
	return Math.abs( got - expected ) <= tol * Math.max( Math.abs( expected ), 1.0 );
}

function arraysClose( got, expected, tol ) {
	var i;
	if ( got.length !== expected.length ) {
		return false;
	}
	for ( i = 0; i < expected.length; i++ ) {
		if ( !close( got[ i ], expected[ i ], tol ) ) {
			return false;
		}
	}
	return true;
}

function makeAP( interleaved ) {
	var arr = new Complex128Array( interleaved.length / 2 );
	var v = reinterpret( arr, 0 );
	var i;
	for ( i = 0; i < interleaved.length; i++ ) {
		v[ i ] = interleaved[ i ];
	}
	return arr;
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlatps, 'function' );
});

test( 'zlatps.ndarray: upper, no-transpose, non-unit (3x3)', function t() {
	var AP = makeAP( [ 2.0, 1.0, 1.0, 1.0, 3.0, 0.5, 0.5, 0.0, 1.0, -1.0, 4.0, -1.0 ] );
	var x = makeAP( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = zlatps( 'upper', 'no-transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxUpperN.info );
	assert.ok( close( scale[ 0 ], fxUpperN.scale, TOL ) );
	assert.ok( arraysClose( reinterpret( x, 0 ), fxUpperN.x, TOL ), 'x matches' );
	assert.ok( arraysClose( CNORM, fxUpperN.cnorm, TOL ), 'cnorm matches' );
});

test( 'zlatps.ndarray: lower, no-transpose, non-unit (3x3)', function t() {
	var AP = makeAP( [ 2.0, 1.0, 1.0, 1.0, 0.5, 0.0, 3.0, 0.5, 1.0, -1.0, 4.0, -1.0 ] );
	var x = makeAP( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = zlatps( 'lower', 'no-transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxLowerN.info );
	assert.ok( close( scale[ 0 ], fxLowerN.scale, TOL ) );
	assert.ok( arraysClose( reinterpret( x, 0 ), fxLowerN.x, TOL ) );
	assert.ok( arraysClose( CNORM, fxLowerN.cnorm, TOL ) );
});

test( 'zlatps.ndarray: upper, conjugate-transpose, non-unit (3x3)', function t() {
	var AP = makeAP( [ 2.0, 1.0, 1.0, 1.0, 3.0, 0.5, 0.5, 0.0, 1.0, -1.0, 4.0, -1.0 ] );
	var x = makeAP( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = zlatps( 'upper', 'conjugate-transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxUpperC.info );
	assert.ok( close( scale[ 0 ], fxUpperC.scale, TOL ) );
	assert.ok( arraysClose( reinterpret( x, 0 ), fxUpperC.x, TOL ) );
});

test( 'zlatps.ndarray: lower, conjugate-transpose, non-unit (3x3)', function t() {
	var AP = makeAP( [ 2.0, 1.0, 1.0, 1.0, 0.5, 0.0, 3.0, 0.5, 1.0, -1.0, 4.0, -1.0 ] );
	var x = makeAP( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = zlatps( 'lower', 'conjugate-transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxLowerC.info );
	assert.ok( close( scale[ 0 ], fxLowerC.scale, TOL ) );
	assert.ok( arraysClose( reinterpret( x, 0 ), fxLowerC.x, TOL ) );
});

test( 'zlatps.ndarray: upper, no-transpose, unit diagonal (3x3)', function t() {
	var AP = makeAP( [ 99.0, 99.0, 1.0, 1.0, 99.0, 99.0, 0.5, 0.0, 1.0, -1.0, 99.0, 99.0 ] );
	var x = makeAP( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = zlatps( 'upper', 'no-transpose', 'unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxUpperNUnit.info );
	assert.ok( close( scale[ 0 ], fxUpperNUnit.scale, TOL ) );
	assert.ok( arraysClose( reinterpret( x, 0 ), fxUpperNUnit.x, TOL ) );
});

test( 'zlatps.ndarray: lower, no-transpose, unit diagonal (3x3)', function t() {
	var AP = makeAP( [ 99.0, 99.0, 1.0, 1.0, 0.5, 0.0, 99.0, 99.0, 1.0, -1.0, 99.0, 99.0 ] );
	var x = makeAP( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = zlatps( 'lower', 'no-transpose', 'unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxLowerNUnit.info );
	assert.ok( close( scale[ 0 ], fxLowerNUnit.scale, TOL ) );
	assert.ok( arraysClose( reinterpret( x, 0 ), fxLowerNUnit.x, TOL ) );
});

test( 'zlatps.ndarray: upper, conjugate-transpose, unit diagonal', function t() {
	var AP = makeAP( [ 99.0, 99.0, 1.0, 1.0, 99.0, 99.0, 0.5, 0.0, 1.0, -1.0, 99.0, 99.0 ] );
	var x = makeAP( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = zlatps( 'upper', 'conjugate-transpose', 'unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxUpperCUnit.info );
	assert.ok( close( scale[ 0 ], fxUpperCUnit.scale, TOL ) );
	assert.ok( arraysClose( reinterpret( x, 0 ), fxUpperCUnit.x, TOL ) );
});

test( 'zlatps.ndarray: lower, conjugate-transpose, unit diagonal', function t() {
	var AP = makeAP( [ 99.0, 99.0, 1.0, 1.0, 0.5, 0.0, 99.0, 99.0, 1.0, -1.0, 99.0, 99.0 ] );
	var x = makeAP( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = zlatps( 'lower', 'conjugate-transpose', 'unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxLowerCUnit.info );
	assert.ok( close( scale[ 0 ], fxLowerCUnit.scale, TOL ) );
	assert.ok( arraysClose( reinterpret( x, 0 ), fxLowerCUnit.x, TOL ) );
});

test( 'zlatps.ndarray: N=0 quick return', function t() {
	var AP = new Complex128Array( 1 );
	var x = new Complex128Array( 1 );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 1 );
	var info = zlatps( 'upper', 'no-transpose', 'non-unit', 'no', 0, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxNZero.info );
});

test( 'zlatps.ndarray: N=1', function t() {
	var AP = makeAP( [ 5.0, 2.0 ] );
	var x = makeAP( [ 10.0, -3.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 1 );
	var info = zlatps( 'upper', 'no-transpose', 'non-unit', 'no', 1, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxNOne.info );
	assert.ok( close( scale[ 0 ], fxNOne.scale, TOL ) );
	assert.ok( arraysClose( reinterpret( x, 0 ), fxNOne.x, TOL ) );
});

test( 'zlatps.ndarray: upper, no-transpose, non-unit, normin=yes (3x3)', function t() {
	var AP = makeAP( [ 2.0, 1.0, 1.0, 1.0, 3.0, 0.5, 0.5, 0.0, 1.0, -1.0, 4.0, -1.0 ] );
	var x = makeAP( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( [ 0.0, 2.0, 2.5 ] );
	var info = zlatps( 'upper', 'no-transpose', 'non-unit', 'yes', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxUpperNNorminY.info );
	assert.ok( close( scale[ 0 ], fxUpperNNorminY.scale, TOL ) );
	assert.ok( arraysClose( reinterpret( x, 0 ), fxUpperNNorminY.x, TOL ) );
});

test( 'zlatps.ndarray: lower, transpose, unit, normin=yes (3x3)', function t() {
	var AP = makeAP( [ 99.0, 99.0, 1.0, 1.0, 0.5, 0.0, 99.0, 99.0, 1.0, -1.0, 99.0, 99.0 ] );
	var x = makeAP( [ 5.0, 1.0, 3.0, -2.0, 1.0, 0.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( [ 2.5, 2.0, 0.0 ] );
	var info = zlatps( 'lower', 'transpose', 'unit', 'yes', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxLowerTUnitNorminY.info );
	assert.ok( close( scale[ 0 ], fxLowerTUnitNorminY.scale, TOL ) );
	assert.ok( arraysClose( reinterpret( x, 0 ), fxLowerTUnitNorminY.x, TOL ) );
});

test( 'zlatps.ndarray: 4x4 upper, no-transpose', function t() {
	var AP = makeAP( [ 3.0, 0.0, 1.0, 0.5, 4.0, 1.0, 0.0, 1.0, 1.0, 0.0, 2.0, -1.0, 0.5, 0.0, 0.0, 0.5, 1.0, 1.0, 5.0, 0.0 ] );
	var x = makeAP( [ 1.0, 1.0, 2.0, 0.0, 0.0, 3.0, 1.0, -2.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 4 );
	var info = zlatps( 'upper', 'no-transpose', 'non-unit', 'no', 4, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxUpperN4x4.info );
	assert.ok( close( scale[ 0 ], fxUpperN4x4.scale, TOL ) );
	assert.ok( arraysClose( reinterpret( x, 0 ), fxUpperN4x4.x, TOL ) );
});

test( 'zlatps.ndarray: 4x4 lower, conjugate-transpose', function t() {
	var AP = makeAP( [ 3.0, 0.0, 1.0, 0.5, 0.0, 1.0, 0.5, 0.0, 4.0, 1.0, 1.0, 0.0, 0.0, 0.5, 2.0, -1.0, 1.0, 1.0, 5.0, 0.0 ] );
	var x = makeAP( [ 1.0, 1.0, 2.0, 0.0, 0.0, 3.0, 1.0, -2.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 4 );
	var info = zlatps( 'lower', 'conjugate-transpose', 'non-unit', 'no', 4, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxLowerC4x4.info );
	assert.ok( close( scale[ 0 ], fxLowerC4x4.scale, TOL ) );
	assert.ok( arraysClose( reinterpret( x, 0 ), fxLowerC4x4.x, TOL ) );
});

test( 'zlatps.ndarray: upper N careful (tiny diagonal)', function t() {
	var AP = makeAP( [ 1.0e-300, 0.0, 1.0, 1.0, 1.0e-300, 0.0, 0.5, 0.0, 1.0, -1.0, 1.0e-300, 0.0 ] );
	var x = makeAP( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = zlatps( 'upper', 'no-transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxUpperNCareful.info );
	assert.ok( close( scale[ 0 ], fxUpperNCareful.scale, TOL ) );
});

test( 'zlatps.ndarray: lower N careful (tiny diagonal)', function t() {
	var AP = makeAP( [ 1.0e-300, 0.0, 1.0, 1.0, 0.5, 0.0, 1.0e-300, 0.0, 1.0, -1.0, 1.0e-300, 0.0 ] );
	var x = makeAP( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = zlatps( 'lower', 'no-transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxLowerNCareful.info );
	assert.ok( close( scale[ 0 ], fxLowerNCareful.scale, TOL ) );
});

test( 'zlatps.ndarray: upper C careful (tiny diagonal)', function t() {
	var AP = makeAP( [ 1.0e-300, 0.0, 1.0, 1.0, 1.0e-300, 0.0, 0.5, 0.0, 1.0, -1.0, 1.0e-300, 0.0 ] );
	var x = makeAP( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = zlatps( 'upper', 'conjugate-transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxUpperCCareful.info );
	assert.ok( close( scale[ 0 ], fxUpperCCareful.scale, TOL ) );
});

test( 'zlatps.ndarray: lower C careful (tiny diagonal)', function t() {
	var AP = makeAP( [ 1.0e-300, 0.0, 1.0, 1.0, 0.5, 0.0, 1.0e-300, 0.0, 1.0, -1.0, 1.0e-300, 0.0 ] );
	var x = makeAP( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = zlatps( 'lower', 'conjugate-transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxLowerCCareful.info );
	assert.ok( close( scale[ 0 ], fxLowerCCareful.scale, TOL ) );
});

test( 'zlatps.ndarray: upper N unit careful (huge off-diagonal)', function t() {
	var AP = makeAP( [ 99.0, 99.0, 1.0e150, 1.0e150, 99.0, 99.0, 1.0e150, 0.0, 1.0e150, -1.0e150, 99.0, 99.0 ] );
	var x = makeAP( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = zlatps( 'upper', 'no-transpose', 'unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxUpperNUnitCareful.info );
	assert.ok( close( scale[ 0 ], fxUpperNUnitCareful.scale, TOL ) );
});

test( 'zlatps.ndarray: upper transpose (non-conjugate) non-unit', function t() {
	var AP = makeAP( [ 2.0, 1.0, 1.0, 1.0, 3.0, 0.5, 0.5, 0.0, 1.0, -1.0, 4.0, -1.0 ] );
	var x = makeAP( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = zlatps( 'upper', 'transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 1.0 );
	// finiteness check
	var v = reinterpret( x, 0 );
	for ( var i = 0; i < v.length; i++ ) {
		assert.ok( isFinite( v[ i ] ) );
	}
});

test( 'zlatps.ndarray: lower transpose unit', function t() {
	var AP = makeAP( [ 99.0, 99.0, 1.0, 1.0, 0.5, 0.0, 99.0, 99.0, 1.0, -1.0, 99.0, 99.0 ] );
	var x = makeAP( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = zlatps( 'lower', 'transpose', 'unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 1.0 );
});

test( 'zlatps.ndarray: upper transpose careful (tiny diagonal)', function t() {
	var AP = makeAP( [ 1.0e-300, 0.0, 1.0, 1.0, 1.0e-300, 0.0, 0.5, 0.0, 1.0, -1.0, 1.0e-300, 0.0 ] );
	var x = makeAP( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = zlatps( 'upper', 'transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
	var v = reinterpret( x, 0 );
	for ( var i = 0; i < v.length; i++ ) {
		assert.ok( isFinite( v[ i ] ) );
	}
});

test( 'zlatps.ndarray: lower transpose careful (tiny diagonal)', function t() {
	var AP = makeAP( [ 1.0e-300, 0.0, 1.0, 1.0, 0.5, 0.0, 1.0e-300, 0.0, 1.0, -1.0, 1.0e-300, 0.0 ] );
	var x = makeAP( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = zlatps( 'lower', 'transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zlatps.ndarray: upper transpose unit careful', function t() {
	var AP = makeAP( [ 99.0, 99.0, 1.0e150, 1.0e150, 99.0, 99.0, 1.0e150, 0.0, 1.0e150, -1.0e150, 99.0, 99.0 ] );
	var x = makeAP( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = zlatps( 'upper', 'transpose', 'unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zlatps.ndarray: upper conjugate-transpose unit careful (huge off-diagonal)', function t() {
	var AP = makeAP( [ 99.0, 99.0, 1.0e150, 1.0e150, 99.0, 99.0, 1.0e150, 0.0, 1.0e150, -1.0e150, 99.0, 99.0 ] );
	var x = makeAP( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = zlatps( 'upper', 'conjugate-transpose', 'unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zlatps.ndarray: huge x triggers transpose rec scaling', function t() {
	// huge x + huge CNORM forces rec-scaling block in transpose careful path.
	var AP = makeAP( [ 1.0e-200, 0.0, 1.0e200, 1.0e200, 1.0e-200, 0.0, 1.0e200, 0.0, 1.0e200, 0.0, 1.0e-200, 0.0 ] );
	var x = makeAP( [ 1.0e150, 1.0e150, 1.0e150, 1.0e150, 1.0e150, 1.0e150 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = zlatps( 'upper', 'transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zlatps.ndarray: huge x triggers conjugate-transpose rec scaling', function t() {
	var AP = makeAP( [ 1.0e-200, 0.0, 1.0e200, 1.0e200, 1.0e-200, 0.0, 1.0e200, 0.0, 1.0e200, 0.0, 1.0e-200, 0.0 ] );
	var x = makeAP( [ 1.0e150, 1.0e150, 1.0e150, 1.0e150, 1.0e150, 1.0e150 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = zlatps( 'upper', 'conjugate-transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zlatps.ndarray: zero diagonal forces unit-vector substitution', function t() {
	var AP = makeAP( [ 0.0, 0.0, 1.0, 1.0, 1.0, 0.0 ] );
	var x = makeAP( [ 2.0, 0.0, 3.0, 1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 2 );
	var info = zlatps( 'upper', 'no-transpose', 'non-unit', 'no', 2, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 0.0 );
});

test( 'zlatps.ndarray: zero diagonal in transpose path', function t() {
	var AP = makeAP( [ 1.0, 0.0, 1.0, 0.0, 0.0, 0.0 ] );
	var x = makeAP( [ 2.0, 0.0, 3.0, 0.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 2 );
	var info = zlatps( 'upper', 'transpose', 'non-unit', 'no', 2, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 0.0 );
});

test( 'zlatps.ndarray: zero diagonal in conjugate-transpose path', function t() {
	var AP = makeAP( [ 1.0, 0.0, 1.0, 0.0, 0.0, 0.0 ] );
	var x = makeAP( [ 2.0, 0.0, 3.0, 0.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 2 );
	var info = zlatps( 'upper', 'conjugate-transpose', 'non-unit', 'no', 2, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 0.0 );
});

test( 'zlatps.ndarray: huge initial xmax triggers pre-scale', function t() {
	var AP = makeAP( [ 1.0e-300, 0.0, 1.0e-300, 0.0, 1.0e-300, 0.0 ] );
	var x = makeAP( [ 1.0e308, 0.0, 1.0e308, 0.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 2 );
	var info = zlatps( 'upper', 'no-transpose', 'non-unit', 'no', 2, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zlatps.ndarray: throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlatps( 'invalid', 'no-transpose', 'non-unit', 'no', 1, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0 );
	}, TypeError );
});

test( 'zlatps.ndarray: throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zlatps( 'upper', 'bad', 'non-unit', 'no', 1, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0 );
	}, TypeError );
});

test( 'zlatps.ndarray: throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		zlatps( 'upper', 'no-transpose', 'bad', 'no', 1, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0 );
	}, TypeError );
});

test( 'zlatps.ndarray: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlatps( 'upper', 'no-transpose', 'non-unit', 'no', -1, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0 );
	}, RangeError );
});
