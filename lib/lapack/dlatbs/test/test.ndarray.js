/* eslint-disable no-restricted-syntax, max-len */

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
import battery from './fixtures/battery.json' with { type: 'json' };


// VARIABLES //

const TOL = 1e-9;
const BIG_SENTINEL = 4.9896007738368e+291; // 2^969, half of BIGNUM


// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
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
	const ab = new Float64Array( kdp1 * n );
	let i;
	for ( i = 0; i < entries.length; i++ ) {
		ab[ (entries[i][1] * kdp1) + entries[i][0] ] = entries[i][2];
	}
	return ab;
}

function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

function allFinite( arr ) {
	let i;
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
	const tc = upper_n_nonunit;
	const ab = bandedMatrix( 3, 4, [
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
	const x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 4 );
	const info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
	assertArrayClose( toArray( cnorm ), tc.cnorm, TOL, 'cnorm' );
});

test( 'dlatbs.ndarray: lower, no-transpose, non-unit (4x4 KD=2)', function t() {
	const tc = lower_n_nonunit;
	const ab = bandedMatrix( 3, 4, [
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
	const x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 4 );
	const info = dlatbs( 'lower', 'no-transpose', 'non-unit', 'no', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
	assertArrayClose( toArray( cnorm ), tc.cnorm, TOL, 'cnorm' );
});

test( 'dlatbs.ndarray: upper, transpose, non-unit (4x4 KD=2)', function t() {
	const tc = upper_t_nonunit;
	const ab = bandedMatrix( 3, 4, [
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
	const x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 4 );
	const info = dlatbs( 'upper', 'transpose', 'non-unit', 'no', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
	assertArrayClose( toArray( cnorm ), tc.cnorm, TOL, 'cnorm' );
});

test( 'dlatbs.ndarray: lower, transpose, non-unit (4x4 KD=2)', function t() {
	const tc = lower_t_nonunit;
	const ab = bandedMatrix( 3, 4, [
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
	const x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 4 );
	const info = dlatbs( 'lower', 'transpose', 'non-unit', 'no', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
	assertArrayClose( toArray( cnorm ), tc.cnorm, TOL, 'cnorm' );
});

test( 'dlatbs.ndarray: upper, no-transpose, unit (4x4 KD=2)', function t() {
	const tc = upper_n_unit;
	const ab = bandedMatrix( 3, 4, [
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
	const x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 4 );
	const info = dlatbs( 'upper', 'no-transpose', 'unit', 'no', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
	assertArrayClose( toArray( cnorm ), tc.cnorm, TOL, 'cnorm' );
});

test( 'dlatbs.ndarray: lower, no-transpose, unit (4x4 KD=2)', function t() {
	const tc = lower_n_unit;
	const ab = bandedMatrix( 3, 4, [
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
	const x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 4 );
	const info = dlatbs( 'lower', 'no-transpose', 'unit', 'no', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
	assertArrayClose( toArray( cnorm ), tc.cnorm, TOL, 'cnorm' );
});

test( 'dlatbs.ndarray: upper, transpose, unit (4x4 KD=2)', function t() {
	const tc = upper_t_unit;
	const ab = bandedMatrix( 3, 4, [
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
	const x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 4 );
	const info = dlatbs( 'upper', 'transpose', 'unit', 'no', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
});

test( 'dlatbs.ndarray: lower, transpose, unit (4x4 KD=2)', function t() {
	const tc = lower_t_unit;
	const ab = bandedMatrix( 3, 4, [
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
	const x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 4 );
	const info = dlatbs( 'lower', 'transpose', 'unit', 'no', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
});

test( 'dlatbs.ndarray: N=0 quick return', function t() {
	const tc = n_zero;
	const ab = new Float64Array( 1 );
	const x = new Float64Array( 1 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 1 );
	const info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 0, 0, ab, 1, 1, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( scale[ 0 ], 1.0, 'scale set to 1' );
});

test( 'dlatbs.ndarray: N=1', function t() {
	const tc = n_one;
	const ab = new Float64Array([ 5.0 ]);
	const x = new Float64Array([ 10.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 1 );
	const info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 1, 0, ab, 1, 1, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
});

test( 'dlatbs.ndarray: normin=yes (precomputed cnorm, upper N nonunit)', function t() {
	const tc = normin_y;
	const ab = bandedMatrix( 3, 4, [
		[2, 0, 4.0], [1, 1, 2.0], [2, 1, 3.0], [0, 2, 1.0], [1, 2, 1.0], [2, 2, 5.0], [0, 3, 2.0], [1, 3, 3.0], [2, 3, 6.0]
	]);
	const x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array([ 0.0, 2.0, 2.0, 5.0 ]);
	const info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'yes', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
});

test( 'dlatbs.ndarray: KD=1 upper (tridiagonal-style)', function t() {
	const tc = upper_kd1;
	const ab = bandedMatrix( 2, 4, [
		[1, 0, 3.0], [0, 1, 1.0], [1, 1, 4.0], [0, 2, 2.0], [1, 2, 5.0], [0, 3, 1.0], [1, 3, 6.0]
	]);
	const x = new Float64Array([ 2.0, 3.0, 1.0, 5.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 4 );
	const info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 4, 1, ab, 1, 2, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
});

test( 'dlatbs.ndarray: KD=1 lower transpose (tridiagonal-style)', function t() {
	const tc = lower_t_kd1;
	const ab = bandedMatrix( 2, 4, [
		[0, 0, 3.0], [1, 0, 1.0], [0, 1, 4.0], [1, 1, 2.0], [0, 2, 5.0], [1, 2, 1.0], [0, 3, 6.0]
	]);
	const x = new Float64Array([ 2.0, 3.0, 1.0, 5.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 4 );
	const info = dlatbs( 'lower', 'transpose', 'non-unit', 'no', 4, 1, ab, 1, 2, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
});

test( 'dlatbs.ndarray: lower transpose nonunit, normin=yes', function t() {
	const tc = lower_t_nonunit_normin_y;
	const ab = bandedMatrix( 3, 4, [
		[0, 0, 4.0], [1, 0, 2.0], [2, 0, 1.0], [0, 1, 3.0], [1, 1, 1.0], [2, 1, 2.0], [0, 2, 5.0], [1, 2, 3.0], [0, 3, 6.0]
	]);
	const x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array([ 3.0, 3.0, 3.0, 0.0 ]);
	const info = dlatbs( 'lower', 'transpose', 'non-unit', 'yes', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
});

test( 'dlatbs.ndarray: upper transpose nonunit, normin=yes', function t() {
	const tc = upper_t_nonunit_normin_y;
	const ab = bandedMatrix( 3, 4, [
		[2, 0, 4.0], [1, 1, 2.0], [2, 1, 3.0], [0, 2, 1.0], [1, 2, 1.0], [2, 2, 5.0], [0, 3, 2.0], [1, 3, 3.0], [2, 3, 6.0]
	]);
	const x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array([ 0.0, 2.0, 2.0, 5.0 ]);
	const info = dlatbs( 'upper', 'transpose', 'non-unit', 'yes', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
});

test( 'dlatbs.ndarray: lower no-transpose unit, normin=yes', function t() {
	const tc = lower_n_unit_normin_y;
	const ab = bandedMatrix( 3, 4, [
		[0, 0, 99.0], [1, 0, 2.0], [2, 0, 1.0], [0, 1, 99.0], [1, 1, 1.0], [2, 1, 2.0], [0, 2, 99.0], [1, 2, 3.0], [0, 3, 99.0]
	]);
	const x = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array([ 3.0, 3.0, 3.0, 0.0 ]);
	const info = dlatbs( 'lower', 'no-transpose', 'unit', 'yes', 4, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
});

test( 'dlatbs.ndarray: singular upper (zero diagonal forces e_j substitution)', function t() {
	const tc = singular_upper;
	const ab = bandedMatrix( 2, 3, [
		[1, 0, 2.0], [0, 1, 1.0], [1, 1, 0.0], [0, 2, 1.0], [1, 2, 3.0]
	]);
	const x = new Float64Array([ 1.0, 1.0, 1.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 3, 1, ab, 1, 2, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( toArray( x ), tc.x, TOL, 'x' );
});

test( 'dlatbs.ndarray: near-singular upper (very small diagonal)', function t() {
	const tc = near_singular_upper;
	const ab = bandedMatrix( 2, 3, [
		[1, 0, 1.0], [0, 1, 1.0], [1, 1, 1e-300], [0, 2, 1.0], [1, 2, 1.0]
	]);
	const x = new Float64Array([ 1.0, 1.0, 1.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 3, 1, ab, 1, 2, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assert.ok( allFinite( x ), 'x is finite' );
});


// EDGE CASES: KD=0 (purely diagonal) //

test( 'dlatbs.ndarray: KD=0 upper, no-transpose, non-unit', function t() {
	const ab = new Float64Array([ 2.0, 3.0, 4.0 ]);
	const x = new Float64Array([ 4.0, 9.0, 16.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 3, 0, ab, 1, 1, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertClose( x[ 0 ], 2.0, TOL, 'x[0]' );
	assertClose( x[ 1 ], 3.0, TOL, 'x[1]' );
	assertClose( x[ 2 ], 4.0, TOL, 'x[2]' );
});

test( 'dlatbs.ndarray: KD=0 lower, no-transpose, non-unit', function t() {
	const ab = new Float64Array([ 2.0, 3.0, 4.0 ]);
	const x = new Float64Array([ 4.0, 9.0, 16.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatbs( 'lower', 'no-transpose', 'non-unit', 'no', 3, 0, ab, 1, 1, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertClose( x[ 0 ], 2.0, TOL, 'x[0]' );
	assertClose( x[ 1 ], 3.0, TOL, 'x[1]' );
	assertClose( x[ 2 ], 4.0, TOL, 'x[2]' );
});

test( 'dlatbs.ndarray: KD=0 upper transpose unit', function t() {
	const ab = new Float64Array([ 99.0, 99.0, 99.0 ]);
	const x = new Float64Array([ 1.0, 2.0, 3.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatbs( 'upper', 'transpose', 'unit', 'no', 3, 0, ab, 1, 1, 0, x, 1, 0, scale, cnorm, 1, 0 );
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
	const ab = bandedMatrix( 4, 4, [
		[3, 0, 2.0],
		[2, 1, 1.0], [3, 1, 3.0],
		[1, 2, 0.5], [2, 2, 1.0], [3, 2, 4.0],
		[0, 3, 0.25], [1, 3, 0.5], [2, 3, 1.0], [3, 3, 5.0]
	]);
	const x = new Float64Array([ 4.0, 9.0, 16.0, 25.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 4 );
	const info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 4, 3, ab, 1, 4, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
	assert.ok( scale[ 0 ] > 0, 'scale>0' );
});

test( 'dlatbs.ndarray: KD=N-1 lower full band 4x4 transpose', function t() {
	const ab = bandedMatrix( 4, 4, [
		[0, 0, 2.0], [1, 0, 0.5], [2, 0, 0.25], [3, 0, 0.1],
		[0, 1, 3.0], [1, 1, 1.0], [2, 1, 0.5],
		[0, 2, 4.0], [1, 2, 1.0],
		[0, 3, 5.0]
	]);
	const x = new Float64Array([ 4.0, 9.0, 16.0, 25.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 4 );
	const info = dlatbs( 'lower', 'transpose', 'non-unit', 'no', 4, 3, ab, 1, 4, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});


// CAREFUL OVERFLOW PATHS — drive the slow code branches //

test( 'dlatbs.ndarray: careful path tiny diagonal upper N nonunit', function t() {
	// Tiny diagonal forces grow*tscal <= SMLNUM => careful solve.
	const ab = bandedMatrix( 3, 3, [
		[2, 0, 1e-300], [1, 1, 1.0], [2, 1, 1e-300], [0, 2, 0.5], [1, 2, 1.0], [2, 2, 1e-300]
	]);
	const x = new Float64Array([ 1.0, 2.0, 3.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 3, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( scale[ 0 ] >= 0, 'scale>=0' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: careful path tiny diagonal lower N nonunit', function t() {
	const ab = bandedMatrix( 3, 3, [
		[0, 0, 1e-300], [1, 0, 1.0], [2, 0, 0.5], [0, 1, 1e-300], [1, 1, 1.0], [0, 2, 1e-300]
	]);
	const x = new Float64Array([ 1.0, 2.0, 3.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatbs( 'lower', 'no-transpose', 'non-unit', 'no', 3, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: careful path tiny diagonal upper transpose nonunit', function t() {
	const ab = bandedMatrix( 3, 3, [
		[2, 0, 1e-300], [1, 1, 1.0], [2, 1, 1e-300], [0, 2, 0.5], [1, 2, 1.0], [2, 2, 1e-300]
	]);
	const x = new Float64Array([ 1.0, 2.0, 3.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatbs( 'upper', 'transpose', 'non-unit', 'no', 3, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: careful path tiny diagonal lower transpose nonunit', function t() {
	const ab = bandedMatrix( 3, 3, [
		[0, 0, 1e-300], [1, 0, 1.0], [2, 0, 0.5], [0, 1, 1e-300], [1, 1, 1.0], [0, 2, 1e-300]
	]);
	const x = new Float64Array([ 1.0, 2.0, 3.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatbs( 'lower', 'transpose', 'non-unit', 'no', 3, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: huge CNORM triggers tscal scaling', function t() {
	// Huge off-diagonal forces tmax > BIGNUM => tscal != 1 path
	const ab = bandedMatrix( 3, 3, [
		[2, 0, 2.0], [1, 1, 1e308], [2, 1, 3.0], [0, 2, 1e308], [1, 2, 1e308], [2, 2, 4.0]
	]);
	const x = new Float64Array([ 1.0, 1.0, 1.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 3, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: huge initial xmax pre-scaling upper', function t() {
	// xmax > BIGNUM at entry => initial dscal of x.
	const ab = bandedMatrix( 2, 2, [
		[1, 0, 1e-300], [0, 1, 1e-300], [1, 1, 1e-300]
	]);
	const x = new Float64Array([ 1e308, 1e308 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 2 );
	const info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 2, 1, ab, 1, 2, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: zero diagonal in transpose path', function t() {
	// Singular column hit during transpose careful path
	const ab = bandedMatrix( 2, 2, [
		[1, 0, 1.0], [0, 1, 1.0], [1, 1, 0.0]
	]);
	const x = new Float64Array([ 2.0, 3.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 2 );
	const info = dlatbs( 'upper', 'transpose', 'non-unit', 'no', 2, 1, ab, 1, 2, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( scale[ 0 ], 0.0, 'scale=0 for singular' );
});

test( 'dlatbs.ndarray: unit upper careful path (huge off-diagonal)', function t() {
	const ab = bandedMatrix( 3, 3, [
		[2, 0, 99.0], [1, 1, 1e150], [2, 1, 99.0], [0, 2, 1e150], [1, 2, 1e150], [2, 2, 99.0]
	]);
	const x = new Float64Array([ 1.0, 2.0, 3.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatbs( 'upper', 'no-transpose', 'unit', 'no', 3, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: unit lower careful path (huge off-diagonal)', function t() {
	const ab = bandedMatrix( 3, 3, [
		[0, 0, 99.0], [1, 0, 1e150], [2, 0, 1e150], [0, 1, 99.0], [1, 1, 1e150], [0, 2, 99.0]
	]);
	const x = new Float64Array([ 1.0, 2.0, 3.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatbs( 'lower', 'no-transpose', 'unit', 'no', 3, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: unit upper transpose careful path', function t() {
	const ab = bandedMatrix( 3, 3, [
		[2, 0, 99.0], [1, 1, 1e150], [2, 1, 99.0], [0, 2, 1e150], [1, 2, 1e150], [2, 2, 99.0]
	]);
	const x = new Float64Array([ 1.0, 2.0, 3.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatbs( 'upper', 'transpose', 'unit', 'no', 3, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: unit lower transpose careful path', function t() {
	const ab = bandedMatrix( 3, 3, [
		[0, 0, 99.0], [1, 0, 1e150], [2, 0, 1e150], [0, 1, 99.0], [1, 1, 1e150], [0, 2, 99.0]
	]);
	const x = new Float64Array([ 1.0, 2.0, 3.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatbs( 'lower', 'transpose', 'unit', 'no', 3, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: huge x on careful path forces per-step rec scaling', function t() {
	const ab = bandedMatrix( 3, 3, [
		[2, 0, 1e-200], [1, 1, 1.0], [2, 1, 1e-200], [0, 2, 1.0], [1, 2, 1.0], [2, 2, 1e-200]
	]);
	const x = new Float64Array([ 1e150, 1e150, 1e150 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatbs( 'upper', 'no-transpose', 'non-unit', 'no', 3, 2, ab, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( x ), 'x finite' );
});

test( 'dlatbs.ndarray: zero diagonal forces e_j (no-transpose, lower)', function t() {
	const ab = bandedMatrix( 2, 2, [
		[0, 0, 0.0], [1, 0, 1.0], [0, 1, 1.0]
	]);
	const x = new Float64Array([ 1.0, 1.0 ]);
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 2 );
	const info = dlatbs( 'lower', 'no-transpose', 'non-unit', 'no', 2, 1, ab, 1, 2, 0, x, 1, 0, scale, cnorm, 1, 0 );
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


// Regression: the growth-bound loop for the non-transposed, non-unit solve
// left early (Fortran `GO TO`) but then still applied `grow = xbnd`, so a
// solution that would overflow was routed to the unscaled fast path and
// returned NaN with scale = 1 (see test/harness/LEARNINGS.md, 2026-11-18).
function stressEntry( i, j ) {
	if ( i === j ) {
		return 2.0;
	}
	return 1.0e40 * ( ( ( i + ( 2 * j ) ) % 5 ) - 1.5 );
}

function stressSolve( uplo, trans, diag ) {
	const N = 12;
	const kd = N - 1;
	let i, j;
	const AB = new Float64Array( N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( uplo === 'upper' && i <= j ) {
				AB[ ( kd + i - j ) + ( j * N ) ] = stressEntry( i, j );
			} else if ( uplo === 'lower' && i >= j ) {
				AB[ ( i - j ) + ( j * N ) ] = stressEntry( i, j );
			}
		}
	}
	const x = new Float64Array( N );
	for ( i = 0; i < N; i++ ) {
		x[ i ] = 1.0;
	}
	const scale = new Float64Array( 1 );
	const CNORM = new Float64Array( N );
	dlatbs( uplo, trans, diag, 'no', N, kd, AB, 1, N, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.ok( scale[ 0 ] > 0.0 && scale[ 0 ] < 1.0, uplo + ' ' + trans + ' ' + diag + ': solution was rescaled (scale = ' + scale[ 0 ] + ')' );
	for ( i = 0; i < N; i++ ) {
		assert.ok( Number.isFinite( x[ i ] ), uplo + ' ' + trans + ' ' + diag + ': x[' + i + '] is finite (got ' + x[ i ] + ')' );
	}
}

test( 'dlatbs: no-transpose non-unit solve rescales instead of overflowing (upper)', function t() {
	stressSolve( 'upper', 'no-transpose', 'non-unit' );
});

test( 'dlatbs: no-transpose non-unit solve rescales instead of overflowing (lower)', function t() {
	stressSolve( 'lower', 'no-transpose', 'non-unit' );
});

test( 'dlatbs: every trans x diag x uplo solve rescales instead of overflowing (careful path)', function t() {
	const TRANS = [ 'no-transpose', 'transpose' ];
	const UPLO = [ 'upper', 'lower' ];
	const DIAG = [ 'non-unit', 'unit' ];
	TRANS.forEach( function eachTrans( trans ) {
		UPLO.forEach( function eachUplo( uplo ) {
			DIAG.forEach( function eachDiag( diag ) {
				stressSolve( uplo, trans, diag );
			});
		});
	});
});


// REFERENCE BATTERY (ticket 0110) //

// `fixtures/battery.json` holds, for every UPLO x TRANS x DIAG x NORMIN, inputs
// from nine families (well conditioned, diagonal below SMLNUM, small diagonal
// with a huge right-hand side, column norms above BIGNUM with and without a
// huge diagonal, one zero diagonal at each end and in the middle, log-uniform
// magnitudes, large off-diagonals, off-diagonals near BIGNUM / N) and the
// reference outputs x, scale and CNORM (`test/fortran/test_dlatbs.f90`), which
// the JS matches bit for bit (the same operations in the same order). Each
// case runs twice: unit strides with unused band slots NaN and a sentinel tail
// past x and CNORM, and a padded, strided, offset layout that must agree with
// the first bit for bit. Its sentinel is near BIGNUM, so a read past the end
// of x (an `idamax` count one long) changes the scaling and the result.

/**
* Returns whether band slot `r` of column `j` stores a matrix entry.
*
* @private
* @param {Object} tc - test case
* @param {NonNegativeInteger} r - band row
* @param {NonNegativeInteger} j - column
* @returns {boolean} boolean
*/
function inBand( tc, r, j ) {
	if ( tc.uplo === 'U' ) {
		return r >= tc.kd - j;
	}
	return r < tc.N - j;
}

/**
* Solves one battery case in a given layout.
*
* @private
* @param {Object} tc - test case
* @param {Object} lay - layout (`pad`, `sx`, `ox`, `sc`, `oc`, `lda`, `oa`, `fill`)
* @returns {Object} results
*/
function solveBattery( tc, lay ) {
	const ldab = tc.kd + 1;
	const N = tc.N;
	const AB = new Float64Array( lay.oa + ( lay.lda * N ) );
	const x = new Float64Array( lay.ox + ( lay.sx * N ) + lay.pad );
	const CNORM = new Float64Array( lay.oc + ( lay.sc * N ) + lay.pad );
	const scale = new Float64Array([ -1.0 ]);
	let info;
	let r;
	let j;
	AB.fill( NaN );
	x.fill( lay.fill );
	CNORM.fill( lay.fill );
	for ( j = 0; j < N; j++ ) {
		for ( r = 0; r < ldab; r++ ) {
			if ( inBand( tc, r, j ) ) {
				AB[ lay.oa + r + ( j * lay.lda ) ] = tc.AB[ r + ( j * ldab ) ];
			}
		}
		x[ lay.ox + ( j * lay.sx ) ] = tc.x0[ j ];
		CNORM[ lay.oc + ( j * lay.sc ) ] = tc.cnorm0[ j ];
	}
	info = dlatbs( ( tc.uplo === 'U' ) ? 'upper' : 'lower', ( tc.trans === 'N' ) ? 'no-transpose' : 'transpose', ( tc.diag === 'N' ) ? 'non-unit' : 'unit', ( tc.normin === 'N' ) ? 'no' : 'yes', N, tc.kd, AB, 1, lay.lda, lay.oa, x, lay.sx, lay.ox, scale, CNORM, lay.sc, lay.oc );
	return {
		'info': info,
		'scale': scale[ 0 ],
		'x': x,
		'CNORM': CNORM
	};
}

/**
* Returns the entries of a strided vector, and asserts that every other slot still holds the sentinel.
*
* @private
* @param {Float64Array} v - buffer
* @param {NonNegativeInteger} N - length
* @param {PositiveInteger} s - stride
* @param {NonNegativeInteger} o - offset
* @param {number} fill - sentinel
* @param {string} msg - message
* @returns {Array} entries
*/
function gather( v, N, s, o, fill, msg ) {
	const out = [];
	let i;
	for ( i = 0; i < v.length; i++ ) {
		if ( i >= o && ( i - o ) % s === 0 && ( i - o ) / s < N ) {
			out.push( v[ i ] );
		} else {
			assert.ok( v[ i ] === fill, msg + ': slot ' + i + ' outside the vector was written (' + v[ i ] + ')' );
		}
	}
	return out;
}

test( 'dlatbs.ndarray: reference battery (x, scale, CNORM; sentinels; layout invariance)', function t() {
	const unit = {
		'pad': 3,
		'sx': 1,
		'ox': 0,
		'sc': 1,
		'oc': 0,
		'lda': 0,
		'oa': 0,
		'fill': 4096.0
	};
	let other;
	let base;
	let tc;
	let xs;
	let cs;
	let k;
	for ( k = 0; k < battery.length; k++ ) {
		tc = battery[ k ];
		unit.lda = tc.kd + 1;
		base = solveBattery( tc, unit );
		assert.equal( base.info, 0, tc.name + ': info' );
		assert.ok( Object.is( base.scale, tc.scale ), tc.name + ': scale expected ' + tc.scale + ', got ' + base.scale );
		xs = gather( base.x, tc.N, 1, 0, 4096.0, tc.name + ': x' );
		cs = gather( base.CNORM, tc.N, 1, 0, 4096.0, tc.name + ': CNORM' );
		assert.deepStrictEqual( xs, tc.x, tc.name + ': x' );
		assert.deepStrictEqual( cs, tc.cnorm, tc.name + ': CNORM' );
		other = solveBattery( tc, {
			'pad': 2,
			'sx': 2,
			'ox': 3,
			'sc': 3,
			'oc': 1,
			'lda': tc.kd + 3,
			'oa': 2,
			'fill': BIG_SENTINEL
		});
		assert.ok( Object.is( other.scale, base.scale ), tc.name + ': strided scale' );
		assert.deepStrictEqual( gather( other.x, tc.N, 2, 3, BIG_SENTINEL, tc.name + ': strided x' ), xs, tc.name + ': strided x' );
		assert.deepStrictEqual( gather( other.CNORM, tc.N, 3, 1, BIG_SENTINEL, tc.name + ': strided CNORM' ), cs, tc.name + ': strided CNORM' );
	}
});
