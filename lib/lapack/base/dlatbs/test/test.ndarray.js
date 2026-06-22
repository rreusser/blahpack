/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatbs from './../lib/ndarray.js';

// FIXTURES //

import upper_n_nonunit from './fixtures/upper_n_nonunit.json' with { type: 'json' };
import lower_n_nonunit from './fixtures/lower_n_nonunit.json' with { type: 'json' };
import upper_t_nonunit from './fixtures/upper_t_nonunit.json' with { type: 'json' };
import lower_t_nonunit from './fixtures/lower_t_nonunit.json' with { type: 'json' };
import upper_n_unit from './fixtures/upper_n_unit.json' with { type: 'json' };
import lower_n_unit from './fixtures/lower_n_unit.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import normin_y from './fixtures/normin_y.json' with { type: 'json' };
import upper_kd1 from './fixtures/upper_kd1.json' with { type: 'json' };
import upper_t_unit from './fixtures/upper_t_unit.json' with { type: 'json' };
import lower_t_unit from './fixtures/lower_t_unit.json' with { type: 'json' };
import lower_t_nonunit_normin_y from './fixtures/lower_t_nonunit_normin_y.json' with { type: 'json' };
import upper_t_nonunit_normin_y from './fixtures/upper_t_nonunit_normin_y.json' with { type: 'json' };
import lower_n_unit_normin_y from './fixtures/lower_n_unit_normin_y.json' with { type: 'json' };
import lower_t_kd1 from './fixtures/lower_t_kd1.json' with { type: 'json' };
import singular_upper from './fixtures/singular_upper.json' with { type: 'json' };
import near_singular_upper from './fixtures/near_singular_upper.json' with { type: 'json' };


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

/**
* Creates banded storage (KD+1 x N) in column-major from entries.
* entries is array of [row0based, col, value].
*/
function bandedMatrix( kdp1, n, entries ) {
	var ab = new Float64Array( kdp1 * n );
	var i;
	for ( i = 0; i < entries.length; i++ ) {
		ab[ (entries[i][1] * kdp1) + entries[i][0] ] = entries[i][2];
	}
	return ab;
}

function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
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


// TESTS //

test( 'dlatbs.ndarray: main export is a function', function t() {
	assert.strictEqual( typeof dlatbs, 'function', 'main export is a function' );
});

test( 'dlatbs.ndarray: upper, no-transpose, non-unit (4x4 KD=2)', function t() {
	var tc = upper_n_nonunit;
	var ab = bandedMatrix( 3, 4, [
		[2, 0, 4.0],
		[1, 1, 2.0],
		[2, 1, 3.0],
		[0, 2, 1.0],
		[1, 2, 1.0],
		[2, 2, 5.0],
		[0, 3, 2.0],
		[1, 3, 3.0],
		[2, 3, 6.0]
	]);
	var x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 4 );
	var info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
	assertArrayClose( toArray( cnorm ), tc.cnorm, TOL, 'cnorm' );
});

test( 'dlatbs.ndarray: lower, no-transpose, non-unit (4x4 KD=2)', function t() {
	var tc = lower_n_nonunit;
	var ab = bandedMatrix( 3, 4, [
		[0, 0, 4.0],
		[1, 0, 2.0],
		[2, 0, 1.0],
		[0, 1, 3.0],
		[1, 1, 1.0],
		[2, 1, 2.0],
		[0, 2, 5.0],
		[1, 2, 3.0],
		[0, 3, 6.0]
	]);
	var x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 4 );
	var info = dlatbs( 'lower', 'no-transpose', 'non-unit', 'no', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
	assertArrayClose( toArray( cnorm ), tc.cnorm, TOL, 'cnorm' );
});

test( 'dlatbs.ndarray: upper, transpose, non-unit (4x4 KD=2)', function t() {
	var tc = upper_t_nonunit;
	var ab = bandedMatrix( 3, 4, [
		[2, 0, 4.0],
		[1, 1, 2.0],
		[2, 1, 3.0],
		[0, 2, 1.0],
		[1, 2, 1.0],
		[2, 2, 5.0],
		[0, 3, 2.0],
		[1, 3, 3.0],
		[2, 3, 6.0]
	]);
	var x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 4 );
	var info = dlatbs( 'upper', 'transpose', 'non-unit', 'no', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
	assertArrayClose( toArray( cnorm ), tc.cnorm, TOL, 'cnorm' );
});

test( 'dlatbs.ndarray: lower, transpose, non-unit (4x4 KD=2)', function t() {
	var tc = lower_t_nonunit;
	var ab = bandedMatrix( 3, 4, [
		[0, 0, 4.0],
		[1, 0, 2.0],
		[2, 0, 1.0],
		[0, 1, 3.0],
		[1, 1, 1.0],
		[2, 1, 2.0],
		[0, 2, 5.0],
		[1, 2, 3.0],
		[0, 3, 6.0]
	]);
	var x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 4 );
	var info = dlatbs( 'lower', 'transpose', 'non-unit', 'no', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
	assertArrayClose( toArray( cnorm ), tc.cnorm, TOL, 'cnorm' );
});

test( 'dlatbs.ndarray: upper, no-transpose, unit (4x4 KD=2)', function t() {
	var tc = upper_n_unit;
	var ab = bandedMatrix( 3, 4, [
		[2, 0, 99.0],
		[1, 1, 2.0],
		[2, 1, 99.0],
		[0, 2, 1.0],
		[1, 2, 1.0],
		[2, 2, 99.0],
		[0, 3, 2.0],
		[1, 3, 3.0],
		[2, 3, 99.0]
	]);
	var x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 4 );
	var info = dlatbs( 'upper', 'no-transpose', 'unit', 'no', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
	assertArrayClose( toArray( cnorm ), tc.cnorm, TOL, 'cnorm' );
});

test( 'dlatbs.ndarray: lower, no-transpose, unit (4x4 KD=2)', function t() {
	var tc = lower_n_unit;
	var ab = bandedMatrix( 3, 4, [
		[0, 0, 99.0],
		[1, 0, 2.0],
		[2, 0, 1.0],
		[0, 1, 99.0],
		[1, 1, 1.0],
		[2, 1, 2.0],
		[0, 2, 99.0],
		[1, 2, 3.0],
		[0, 3, 99.0]
	]);
	var x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 4 );
	var info = dlatbs( 'lower', 'no-transpose', 'unit', 'no', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
	assertArrayClose( toArray( cnorm ), tc.cnorm, TOL, 'cnorm' );
});

test( 'dlatbs.ndarray: upper, transpose, unit (4x4 KD=2)', function t() {
	var tc = upper_t_unit;
	var ab = bandedMatrix( 3, 4, [
		[2, 0, 99.0],
		[1, 1, 2.0],
		[2, 1, 99.0],
		[0, 2, 1.0],
		[1, 2, 1.0],
		[2, 2, 99.0],
		[0, 3, 2.0],
		[1, 3, 3.0],
		[2, 3, 99.0]
	]);
	var x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 4 );
	var info = dlatbs( 'upper', 'transpose', 'unit', 'no', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
});

test( 'dlatbs.ndarray: lower, transpose, unit (4x4 KD=2)', function t() {
	var tc = lower_t_unit;
	var ab = bandedMatrix( 3, 4, [
		[0, 0, 99.0],
		[1, 0, 2.0],
		[2, 0, 1.0],
		[0, 1, 99.0],
		[1, 1, 1.0],
		[2, 1, 2.0],
		[0, 2, 99.0],
		[1, 2, 3.0],
		[0, 3, 99.0]
	]);
	var x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 4 );
	var info = dlatbs( 'lower', 'transpose', 'unit', 'no', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
});

test( 'dlatbs.ndarray: N=0 quick return', function t() {
	var tc = n_zero;
	var ab = new Float64Array( 1 );
	var x = new Float64Array( 1 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 1 );
	var info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 0, 0, ab, 1, 1, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( scale[ 0 ], 1.0, 'scale set to 1' );
});

test( 'dlatbs.ndarray: N=1', function t() {
	var tc = n_one;
	var ab = new Float64Array([ 5.0 ]);
	var x = new Float64Array([ 10.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 1 );
	var info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 1, 0, ab, 1, 1, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
});

test( 'dlatbs.ndarray: normin=yes (precomputed cnorm, upper N nonunit)', function t() {
	var tc = normin_y;
	var ab = bandedMatrix( 3, 4, [
		[2, 0, 4.0], [1, 1, 2.0], [2, 1, 3.0], [0, 2, 1.0], [1, 2, 1.0], [2, 2, 5.0], [0, 3, 2.0], [1, 3, 3.0], [2, 3, 6.0]
	]);
	var x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array([ 0.0, 2.0, 2.0, 5.0 ]);
	var info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'yes', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
});

test( 'dlatbs.ndarray: KD=1 upper (tridiagonal-style)', function t() {
	var tc = upper_kd1;
	var ab = bandedMatrix( 2, 4, [
		[1, 0, 3.0], [0, 1, 1.0], [1, 1, 4.0], [0, 2, 2.0], [1, 2, 5.0], [0, 3, 1.0], [1, 3, 6.0]
	]);
	var x = new Float64Array([ 2.0, 3.0, 1.0, 5.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 4 );
	var info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 4, 1, ab, 1, 2, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
});

test( 'dlatbs.ndarray: KD=1 lower transpose (tridiagonal-style)', function t() {
	var tc = lower_t_kd1;
	var ab = bandedMatrix( 2, 4, [
		[0, 0, 3.0], [1, 0, 1.0], [0, 1, 4.0], [1, 1, 2.0], [0, 2, 5.0], [1, 2, 1.0], [0, 3, 6.0]
	]);
	var x = new Float64Array([ 2.0, 3.0, 1.0, 5.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 4 );
	var info = dlatbs( 'lower', 'transpose', 'non-unit', 'no', 4, 1, ab, 1, 2, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
});

test( 'dlatbs.ndarray: lower transpose nonunit, normin=yes', function t() {
	var tc = lower_t_nonunit_normin_y;
	var ab = bandedMatrix( 3, 4, [
		[0, 0, 4.0], [1, 0, 2.0], [2, 0, 1.0], [0, 1, 3.0], [1, 1, 1.0], [2, 1, 2.0], [0, 2, 5.0], [1, 2, 3.0], [0, 3, 6.0]
	]);
	var x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array([ 3.0, 3.0, 3.0, 0.0 ]);
	var info = dlatbs( 'lower', 'transpose', 'non-unit', 'yes', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
});

test( 'dlatbs.ndarray: upper transpose nonunit, normin=yes', function t() {
	var tc = upper_t_nonunit_normin_y;
	var ab = bandedMatrix( 3, 4, [
		[2, 0, 4.0], [1, 1, 2.0], [2, 1, 3.0], [0, 2, 1.0], [1, 2, 1.0], [2, 2, 5.0], [0, 3, 2.0], [1, 3, 3.0], [2, 3, 6.0]
	]);
	var x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array([ 0.0, 2.0, 2.0, 5.0 ]);
	var info = dlatbs( 'upper', 'transpose', 'non-unit', 'yes', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
});

test( 'dlatbs.ndarray: lower no-transpose unit, normin=yes', function t() {
	var tc = lower_n_unit_normin_y;
	var ab = bandedMatrix( 3, 4, [
		[0, 0, 99.0], [1, 0, 2.0], [2, 0, 1.0], [0, 1, 99.0], [1, 1, 1.0], [2, 1, 2.0], [0, 2, 99.0], [1, 2, 3.0], [0, 3, 99.0]
	]);
	var x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array([ 3.0, 3.0, 3.0, 0.0 ]);
	var info = dlatbs( 'lower', 'no-transpose', 'unit', 'yes', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
});

test( 'dlatbs.ndarray: singular upper (zero diagonal forces e_j substitution)', function t() {
	var tc = singular_upper;
	var ab = bandedMatrix( 2, 3, [
		[1, 0, 2.0], [0, 1, 1.0], [1, 1, 0.0], [0, 2, 1.0], [1, 2, 3.0]
	]);
	var x = new Float64Array([ 1.0, 1.0, 1.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 3, 1, ab, 1, 2, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
});

test( 'dlatbs.ndarray: near-singular upper (very small diagonal)', function t() {
	var tc = near_singular_upper;
	var ab = bandedMatrix( 2, 3, [
		[1, 0, 1.0], [0, 1, 1.0], [1, 1, 1e-300], [0, 2, 1.0], [1, 2, 1.0]
	]);
	var x = new Float64Array([ 1.0, 1.0, 1.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 3, 1, ab, 1, 2, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assert.ok( allFinite( x ), 'x is finite' );
});


// EDGE CASES: KD=0 (purely diagonal) //

test( 'dlatbs.ndarray: KD=0 upper, no-transpose, non-unit', function t() {
	var ab = new Float64Array([ 2.0, 3.0, 4.0 ]);
	var x = new Float64Array([ 4.0, 9.0, 16.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 3, 0, ab, 1, 1, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertClose( x[ 0 ], 2.0, TOL, 'x[0]' );
	assertClose( x[ 1 ], 3.0, TOL, 'x[1]' );
	assertClose( x[ 2 ], 4.0, TOL, 'x[2]' );
});

test( 'dlatbs.ndarray: KD=0 lower, no-transpose, non-unit', function t() {
	var ab = new Float64Array([ 2.0, 3.0, 4.0 ]);
	var x = new Float64Array([ 4.0, 9.0, 16.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info = dlatbs( 'lower', 'no-transpose', 'non-unit', 'no', 3, 0, ab, 1, 1, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertClose( x[ 0 ], 2.0, TOL, 'x[0]' );
	assertClose( x[ 1 ], 3.0, TOL, 'x[1]' );
	assertClose( x[ 2 ], 4.0, TOL, 'x[2]' );
});

test( 'dlatbs.ndarray: KD=0 upper transpose unit', function t() {
	var ab = new Float64Array([ 99.0, 99.0, 99.0 ]);
	var x = new Float64Array([ 1.0, 2.0, 3.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info = dlatbs( 'upper', 'transpose', 'unit', 'no', 3, 0, ab, 1, 1, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( scale[ 0 ], 1.0, 'scale=1' );
	// Diagonal-only with unit: x unchanged
	assertClose( x[ 0 ], 1.0, TOL, 'x[0]' );
	assertClose( x[ 1 ], 2.0, TOL, 'x[1]' );
	assertClose( x[ 2 ], 3.0, TOL, 'x[2]' );
});


// EDGE CASES: KD=N-1 (full band) //

test( 'dlatbs.ndarray: KD=N-1 upper full band 4x4', function t() {
	// Triangular full band for upper: KD=3, N=4
	var ab = bandedMatrix( 4, 4, [
		[3, 0, 2.0],
		[2, 1, 1.0], [3, 1, 3.0],
		[1, 2, 0.5], [2, 2, 1.0], [3, 2, 4.0],
		[0, 3, 0.25], [1, 3, 0.5], [2, 3, 1.0], [3, 3, 5.0]
	]);
	var x = new Float64Array([ 4.0, 9.0, 16.0, 25.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 4 );
	var info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 4, 3, ab, 1, 4, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
	assert.ok( scale[ 0 ] > 0, 'scale>0' );
});

test( 'dlatbs.ndarray: KD=N-1 lower full band 4x4 transpose', function t() {
	var ab = bandedMatrix( 4, 4, [
		[0, 0, 2.0], [1, 0, 0.5], [2, 0, 0.25], [3, 0, 0.1],
		[0, 1, 3.0], [1, 1, 1.0], [2, 1, 0.5],
		[0, 2, 4.0], [1, 2, 1.0],
		[0, 3, 5.0]
	]);
	var x = new Float64Array([ 4.0, 9.0, 16.0, 25.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 4 );
	var info = dlatbs( 'lower', 'transpose', 'non-unit', 'no', 4, 3, ab, 1, 4, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});


// CAREFUL OVERFLOW PATHS — drive the slow code branches //

test( 'dlatbs.ndarray: careful path tiny diagonal upper N nonunit', function t() {
	// Tiny diagonal forces grow*tscal <= SMLNUM => careful solve.
	var ab = bandedMatrix( 3, 3, [
		[2, 0, 1e-300], [1, 1, 1.0], [2, 1, 1e-300], [0, 2, 0.5], [1, 2, 1.0], [2, 2, 1e-300]
	]);
	var x = new Float64Array([ 1.0, 2.0, 3.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 3, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( scale[ 0 ] >= 0, 'scale>=0' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: careful path tiny diagonal lower N nonunit', function t() {
	var ab = bandedMatrix( 3, 3, [
		[0, 0, 1e-300], [1, 0, 1.0], [2, 0, 0.5], [0, 1, 1e-300], [1, 1, 1.0], [0, 2, 1e-300]
	]);
	var x = new Float64Array([ 1.0, 2.0, 3.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info = dlatbs( 'lower', 'no-transpose', 'non-unit', 'no', 3, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: careful path tiny diagonal upper transpose nonunit', function t() {
	var ab = bandedMatrix( 3, 3, [
		[2, 0, 1e-300], [1, 1, 1.0], [2, 1, 1e-300], [0, 2, 0.5], [1, 2, 1.0], [2, 2, 1e-300]
	]);
	var x = new Float64Array([ 1.0, 2.0, 3.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info = dlatbs( 'upper', 'transpose', 'non-unit', 'no', 3, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: careful path tiny diagonal lower transpose nonunit', function t() {
	var ab = bandedMatrix( 3, 3, [
		[0, 0, 1e-300], [1, 0, 1.0], [2, 0, 0.5], [0, 1, 1e-300], [1, 1, 1.0], [0, 2, 1e-300]
	]);
	var x = new Float64Array([ 1.0, 2.0, 3.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info = dlatbs( 'lower', 'transpose', 'non-unit', 'no', 3, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: huge CNORM triggers tscal scaling', function t() {
	// Huge off-diagonal forces tmax > BIGNUM => tscal != 1 path
	var ab = bandedMatrix( 3, 3, [
		[2, 0, 2.0], [1, 1, 1e308], [2, 1, 3.0], [0, 2, 1e308], [1, 2, 1e308], [2, 2, 4.0]
	]);
	var x = new Float64Array([ 1.0, 1.0, 1.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 3, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: huge initial xmax pre-scaling upper', function t() {
	// xmax > BIGNUM at entry => initial dscal of x.
	var ab = bandedMatrix( 2, 2, [
		[1, 0, 1e-300], [0, 1, 1e-300], [1, 1, 1e-300]
	]);
	var x = new Float64Array([ 1e308, 1e308 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 2 );
	var info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 2, 1, ab, 1, 2, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: zero diagonal in transpose path', function t() {
	// Singular column hit during transpose careful path
	var ab = bandedMatrix( 2, 2, [
		[1, 0, 1.0], [0, 1, 1.0], [1, 1, 0.0]
	]);
	var x = new Float64Array([ 2.0, 3.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 2 );
	var info = dlatbs( 'upper', 'transpose', 'non-unit', 'no', 2, 1, ab, 1, 2, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( scale[ 0 ], 0.0, 'scale=0 for singular' );
});

test( 'dlatbs.ndarray: unit upper careful path (huge off-diagonal)', function t() {
	var ab = bandedMatrix( 3, 3, [
		[2, 0, 99.0], [1, 1, 1e150], [2, 1, 99.0], [0, 2, 1e150], [1, 2, 1e150], [2, 2, 99.0]
	]);
	var x = new Float64Array([ 1.0, 2.0, 3.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info = dlatbs( 'upper', 'no-transpose', 'unit', 'no', 3, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: unit lower careful path (huge off-diagonal)', function t() {
	var ab = bandedMatrix( 3, 3, [
		[0, 0, 99.0], [1, 0, 1e150], [2, 0, 1e150], [0, 1, 99.0], [1, 1, 1e150], [0, 2, 99.0]
	]);
	var x = new Float64Array([ 1.0, 2.0, 3.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info = dlatbs( 'lower', 'no-transpose', 'unit', 'no', 3, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: unit upper transpose careful path', function t() {
	var ab = bandedMatrix( 3, 3, [
		[2, 0, 99.0], [1, 1, 1e150], [2, 1, 99.0], [0, 2, 1e150], [1, 2, 1e150], [2, 2, 99.0]
	]);
	var x = new Float64Array([ 1.0, 2.0, 3.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info = dlatbs( 'upper', 'transpose', 'unit', 'no', 3, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: unit lower transpose careful path', function t() {
	var ab = bandedMatrix( 3, 3, [
		[0, 0, 99.0], [1, 0, 1e150], [2, 0, 1e150], [0, 1, 99.0], [1, 1, 1e150], [0, 2, 99.0]
	]);
	var x = new Float64Array([ 1.0, 2.0, 3.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info = dlatbs( 'lower', 'transpose', 'unit', 'no', 3, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: huge x on careful path forces per-step rec scaling', function t() {
	var ab = bandedMatrix( 3, 3, [
		[2, 0, 1e-200], [1, 1, 1.0], [2, 1, 1e-200], [0, 2, 1.0], [1, 2, 1.0], [2, 2, 1e-200]
	]);
	var x = new Float64Array([ 1e150, 1e150, 1e150 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 3, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: zero diagonal forces e_j (no-transpose, lower)', function t() {
	var ab = bandedMatrix( 2, 2, [
		[0, 0, 0.0], [1, 0, 1.0], [0, 1, 1.0]
	]);
	var x = new Float64Array([ 1.0, 1.0 ]);
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 2 );
	var info = dlatbs( 'lower', 'no-transpose', 'non-unit', 'no', 2, 1, ab, 1, 2, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( scale[ 0 ], 0.0, 'scale=0 for singular' );
});


// VALIDATION ERRORS //

test( 'dlatbs.ndarray: throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlatbs( 'invalid', 'no-transpose', 'non-unit', 'no', 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0 );
	}, TypeError );
});

test( 'dlatbs.ndarray: throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dlatbs( 'upper', 'bad', 'non-unit', 'no', 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0 );
	}, TypeError );
});

test( 'dlatbs.ndarray: throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dlatbs( 'upper', 'no-transpose', 'bad', 'no', 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0 );
	}, TypeError );
});

test( 'dlatbs.ndarray: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', -1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0 );
	}, RangeError );
});
