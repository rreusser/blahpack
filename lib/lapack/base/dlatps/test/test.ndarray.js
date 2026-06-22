/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatps from './../lib/ndarray.js';

import fxUpperNNonunit from './fixtures/upper_n_nonunit.json' with { type: 'json' };
import fxLowerNNonunit from './fixtures/lower_n_nonunit.json' with { type: 'json' };
import fxUpperTNonunit from './fixtures/upper_t_nonunit.json' with { type: 'json' };
import fxLowerTNonunit from './fixtures/lower_t_nonunit.json' with { type: 'json' };
import fxUpperNUnit from './fixtures/upper_n_unit.json' with { type: 'json' };
import fxLowerTUnit from './fixtures/lower_t_unit.json' with { type: 'json' };
import fxUpperNNorminY from './fixtures/upper_n_normin_y.json' with { type: 'json' };
import fxIdentity from './fixtures/identity.json' with { type: 'json' };
import fxNZero from './fixtures/n_zero.json' with { type: 'json' };
import fxNOne from './fixtures/n_one.json' with { type: 'json' };


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


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlatps, 'function', 'main export is a function' );
});

test( 'dlatps.ndarray: upper, no-transpose, non-unit (3x3)', function t() {
	var AP = new Float64Array( [ 2.0, 1.0, 3.0, 1.0, 2.0, 4.0 ] );
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = dlatps( 'upper', 'no-transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxUpperNNonunit.info );
	assert.ok( close( scale[ 0 ], fxUpperNNonunit.scale, TOL ), 'scale matches' );
	assert.ok( arraysClose( x, fxUpperNNonunit.x, TOL ), 'x matches' );
	assert.ok( arraysClose( CNORM, fxUpperNNonunit.cnorm, TOL ), 'cnorm matches' );
});

test( 'dlatps.ndarray: lower, no-transpose, non-unit (3x3)', function t() {
	var AP = new Float64Array( [ 2.0, 1.0, 1.0, 3.0, 2.0, 4.0 ] );
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = dlatps( 'lower', 'no-transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxLowerNNonunit.info );
	assert.ok( close( scale[ 0 ], fxLowerNNonunit.scale, TOL ), 'scale matches' );
	assert.ok( arraysClose( x, fxLowerNNonunit.x, TOL ), 'x matches' );
	assert.ok( arraysClose( CNORM, fxLowerNNonunit.cnorm, TOL ), 'cnorm matches' );
});

test( 'dlatps.ndarray: upper, transpose, non-unit (3x3)', function t() {
	var AP = new Float64Array( [ 2.0, 1.0, 3.0, 1.0, 2.0, 4.0 ] );
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = dlatps( 'upper', 'transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxUpperTNonunit.info );
	assert.ok( close( scale[ 0 ], fxUpperTNonunit.scale, TOL ), 'scale matches' );
	assert.ok( arraysClose( x, fxUpperTNonunit.x, TOL ), 'x matches' );
});

test( 'dlatps.ndarray: lower, transpose, non-unit (3x3)', function t() {
	var AP = new Float64Array( [ 2.0, 1.0, 1.0, 3.0, 2.0, 4.0 ] );
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = dlatps( 'lower', 'transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxLowerTNonunit.info );
	assert.ok( close( scale[ 0 ], fxLowerTNonunit.scale, TOL ), 'scale matches' );
	assert.ok( arraysClose( x, fxLowerTNonunit.x, TOL ), 'x matches' );
});

test( 'dlatps.ndarray: upper, no-transpose, unit diagonal (3x3)', function t() {
	var AP = new Float64Array( [ 99.0, 1.0, 99.0, 1.0, 2.0, 99.0 ] );
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = dlatps( 'upper', 'no-transpose', 'unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxUpperNUnit.info );
	assert.ok( close( scale[ 0 ], fxUpperNUnit.scale, TOL ), 'scale matches' );
	assert.ok( arraysClose( x, fxUpperNUnit.x, TOL ), 'x matches' );
});

test( 'dlatps.ndarray: lower, transpose, unit diagonal (3x3)', function t() {
	var AP = new Float64Array( [ 99.0, 1.0, 2.0, 99.0, 3.0, 99.0 ] );
	var x = new Float64Array( [ 6.0, 5.0, 4.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = dlatps( 'lower', 'transpose', 'unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxLowerTUnit.info );
	assert.ok( close( scale[ 0 ], fxLowerTUnit.scale, TOL ), 'scale matches' );
	assert.ok( arraysClose( x, fxLowerTUnit.x, TOL ), 'x matches' );
});

test( 'dlatps.ndarray: upper, no-transpose, non-unit, normin=yes (4x4)', function t() {
	var AP = new Float64Array( [ 3.0, 1.0, 4.0, 2.0, 1.0, 2.0, 1.0, 2.0, 1.0, 5.0 ] );
	var x = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( [ 0.0, 1.0, 3.0, 4.0 ] );
	var info = dlatps( 'upper', 'no-transpose', 'non-unit', 'yes', 4, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxUpperNNorminY.info );
	assert.ok( close( scale[ 0 ], fxUpperNNorminY.scale, TOL ), 'scale matches' );
	assert.ok( arraysClose( x, fxUpperNNorminY.x, TOL ), 'x matches' );
});

test( 'dlatps.ndarray: identity matrix passes through unchanged', function t() {
	var AP = new Float64Array( [ 1.0, 0.0, 1.0, 0.0, 0.0, 1.0 ] );
	var x = new Float64Array( [ 7.0, 8.0, 9.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = dlatps( 'upper', 'no-transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxIdentity.info );
	assert.ok( close( scale[ 0 ], fxIdentity.scale, TOL ), 'scale matches' );
	assert.ok( arraysClose( x, fxIdentity.x, TOL ), 'x matches' );
});

test( 'dlatps.ndarray: N=0 quick return', function t() {
	var AP = new Float64Array( 1 );
	var x = new Float64Array( 1 );
	var scale = new Float64Array( [ 0.0 ] );
	var CNORM = new Float64Array( 1 );
	var info = dlatps( 'upper', 'no-transpose', 'non-unit', 'no', 0, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxNZero.info );
	assert.strictEqual( scale[ 0 ], 1.0, 'scale is set to 1' );
});

test( 'dlatps.ndarray: N=1', function t() {
	var AP = new Float64Array( [ 5.0 ] );
	var x = new Float64Array( [ 10.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 1 );
	var info = dlatps( 'upper', 'no-transpose', 'non-unit', 'no', 1, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, fxNOne.info );
	assert.ok( close( scale[ 0 ], fxNOne.scale, TOL ), 'scale matches' );
	assert.ok( arraysClose( x, fxNOne.x, TOL ), 'x matches' );
});

test( 'dlatps.ndarray: lower, no-transpose, unit diagonal (3x3)', function t() {
	var AP = new Float64Array( [ 99.0, 1.0, 2.0, 99.0, 3.0, 99.0 ] );
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = dlatps( 'lower', 'no-transpose', 'unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 1.0 );
	// L*x = b => x1 = 1, x2 = 2 - 1*1 = 1, x3 = 3 - 2*1 - 3*1 = -2
	assert.ok( close( x[ 0 ], 1.0, TOL ) );
	assert.ok( close( x[ 1 ], 1.0, TOL ) );
	assert.ok( close( x[ 2 ], -2.0, TOL ) );
});

test( 'dlatps.ndarray: upper, transpose, unit diagonal (3x3)', function t() {
	var AP = new Float64Array( [ 99.0, 1.0, 99.0, 1.0, 2.0, 99.0 ] );
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = dlatps( 'upper', 'transpose', 'unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 1.0 );
	// U^T*x = b => x1 = 1, x2 = 2 - 1*1 = 1, x3 = 3 - 1*1 - 2*1 = 0
	assert.ok( close( x[ 0 ], 1.0, TOL ) );
	assert.ok( close( x[ 1 ], 1.0, TOL ) );
	assert.ok( close( x[ 2 ], 0.0, TOL ) );
});

test( 'dlatps.ndarray: near-overflow triggers careful path (tiny diagonal)', function t() {
	// Very small diagonal forces careful solve path.
	var AP = new Float64Array( [ 1.0e-300, 1.0, 1.0e-300, 0.5, 1.0, 1.0e-300 ] );
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = dlatps( 'upper', 'no-transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
	// scale is reduced to keep x finite
	assert.ok( scale[ 0 ] >= 0, 'scale is non-negative' );
	assert.ok( isFinite( x[ 0 ] ) && isFinite( x[ 1 ] ) && isFinite( x[ 2 ] ), 'x is finite' );
});

test( 'dlatps.ndarray: large CNORM triggers tscal scaling', function t() {
	// Force the CNORM scaling branch via huge off-diagonal.
	var AP = new Float64Array( [ 2.0, 1.0e308, 3.0, 1.0e308, 1.0e308, 4.0 ] );
	var x = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = dlatps( 'upper', 'no-transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( x[ 0 ] ) && isFinite( x[ 1 ] ) && isFinite( x[ 2 ] ), 'x is finite' );
});

test( 'dlatps.ndarray: lower, transpose, non-unit careful path (tiny diagonal)', function t() {
	var AP = new Float64Array( [ 1.0e-300, 1.0, 0.5, 1.0e-300, 1.0, 1.0e-300 ] );
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = dlatps( 'lower', 'transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( x[ 0 ] ) && isFinite( x[ 1 ] ) && isFinite( x[ 2 ] ), 'x is finite' );
});

test( 'dlatps.ndarray: zero-diagonal forces unit-vector substitution', function t() {
	// Zero on diagonal: tjj == 0 path sets x to e_j and scale to 0.
	var AP = new Float64Array( [ 0.0, 1.0, 1.0 ] );
	var x = new Float64Array( [ 1.0, 1.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 2 );
	var info = dlatps( 'upper', 'no-transpose', 'non-unit', 'no', 2, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
	// The zero diagonal triggers the singular branch -> scale = 0
	assert.strictEqual( scale[ 0 ], 0.0, 'scale set to 0 for singular column' );
});

test( 'dlatps.ndarray: huge initial xmax triggers pre-scaling', function t() {
	// xmax > BIGNUM forces dscal of x prior to careful solve.
	var AP = new Float64Array( [ 1.0e-300, 1.0e-300, 1.0e-300 ] );
	var x = new Float64Array( [ 1.0e308, 1.0e308 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 2 );
	var info = dlatps( 'upper', 'no-transpose', 'non-unit', 'no', 2, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( x[ 0 ] ) && isFinite( x[ 1 ] ), 'x is finite after pre-scaling' );
});

test( 'dlatps.ndarray: unit upper, careful path (huge off-diagonal)', function t() {
	// Unit diagonal + huge off-diagonal forces grow * tscal <= SMLNUM
	var AP = new Float64Array( [ 99.0, 1.0e150, 99.0, 1.0e150, 1.0e150, 99.0 ] );
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = dlatps( 'upper', 'no-transpose', 'unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( x[ 0 ] ) && isFinite( x[ 1 ] ) && isFinite( x[ 2 ] ), 'x is finite' );
});

test( 'dlatps.ndarray: unit lower, careful path (huge off-diagonal)', function t() {
	var AP = new Float64Array( [ 99.0, 1.0e150, 1.0e150, 99.0, 1.0e150, 99.0 ] );
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = dlatps( 'lower', 'no-transpose', 'unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( x[ 0 ] ) && isFinite( x[ 1 ] ) && isFinite( x[ 2 ] ), 'x is finite' );
});

test( 'dlatps.ndarray: unit upper transpose, careful path', function t() {
	var AP = new Float64Array( [ 99.0, 1.0e150, 99.0, 1.0e150, 1.0e150, 99.0 ] );
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = dlatps( 'upper', 'transpose', 'unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( x[ 0 ] ) && isFinite( x[ 1 ] ) && isFinite( x[ 2 ] ), 'x is finite' );
});

test( 'dlatps.ndarray: huge x on careful path forces per-step rec scaling', function t() {
	// Tiny diagonal + huge x forces xj > tjj*BIGNUM branch.
	var AP = new Float64Array( [ 1.0e-200, 1.0, 1.0e-200, 1.0, 1.0, 1.0e-200 ] );
	var x = new Float64Array( [ 1.0e150, 1.0e150, 1.0e150 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = dlatps( 'upper', 'no-transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( x[ 0 ] ) && isFinite( x[ 1 ] ) && isFinite( x[ 2 ] ), 'x is finite' );
});

test( 'dlatps.ndarray: upper transpose careful path (tiny diagonal)', function t() {
	var AP = new Float64Array( [ 1.0e-300, 1.0, 1.0e-300, 0.5, 1.0, 1.0e-300 ] );
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 3 );
	var info = dlatps( 'upper', 'transpose', 'non-unit', 'no', 3, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( x[ 0 ] ) && isFinite( x[ 1 ] ) && isFinite( x[ 2 ] ), 'x is finite' );
});

test( 'dlatps.ndarray: zero diagonal in transpose path forces e_j', function t() {
	// Zero on diagonal + transpose triggers tjj == 0 branch in transpose code.
	var AP = new Float64Array( [ 1.0, 1.0, 0.0 ] );
	var x = new Float64Array( [ 2.0, 3.0 ] );
	var scale = new Float64Array( 1 );
	var CNORM = new Float64Array( 2 );
	var info = dlatps( 'upper', 'transpose', 'non-unit', 'no', 2, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.strictEqual( info, 0 );
	// One column has zero diagonal — algorithm sets x to e_j, scale = 0.
	assert.strictEqual( scale[ 0 ], 0.0 );
});

test( 'dlatps.ndarray: throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlatps( 'invalid', 'no-transpose', 'non-unit', 'no', 1, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0 );
	}, TypeError );
});

test( 'dlatps.ndarray: throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dlatps( 'upper', 'bad', 'non-unit', 'no', 1, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0 );
	}, TypeError );
});

test( 'dlatps.ndarray: throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dlatps( 'upper', 'no-transpose', 'bad', 'no', 1, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0 );
	}, TypeError );
});

test( 'dlatps.ndarray: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlatps( 'upper', 'no-transpose', 'non-unit', 'no', -1, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0 );
	}, RangeError );
});
