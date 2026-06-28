/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrsm from './../lib/index.js';
import base from './../lib/ndarray.js';

// FIXTURES //

import left_upper_notrans_nonunit from './fixtures/left_upper_notrans_nonunit.json' with { type: 'json' };
import left_upper_trans_nonunit from './fixtures/left_upper_trans_nonunit.json' with { type: 'json' };
import left_upper_conjtrans_nonunit from './fixtures/left_upper_conjtrans_nonunit.json' with { type: 'json' };
import left_lower_notrans_nonunit from './fixtures/left_lower_notrans_nonunit.json' with { type: 'json' };
import left_lower_trans_nonunit from './fixtures/left_lower_trans_nonunit.json' with { type: 'json' };
import left_lower_conjtrans_nonunit from './fixtures/left_lower_conjtrans_nonunit.json' with { type: 'json' };
import right_upper_notrans_nonunit from './fixtures/right_upper_notrans_nonunit.json' with { type: 'json' };
import right_upper_trans_nonunit from './fixtures/right_upper_trans_nonunit.json' with { type: 'json' };
import right_upper_conjtrans_nonunit from './fixtures/right_upper_conjtrans_nonunit.json' with { type: 'json' };
import right_lower_notrans_nonunit from './fixtures/right_lower_notrans_nonunit.json' with { type: 'json' };
import right_lower_trans_nonunit from './fixtures/right_lower_trans_nonunit.json' with { type: 'json' };
import right_lower_conjtrans_nonunit from './fixtures/right_lower_conjtrans_nonunit.json' with { type: 'json' };
import left_upper_notrans_unit from './fixtures/left_upper_notrans_unit.json' with { type: 'json' };
import left_upper_trans_unit from './fixtures/left_upper_trans_unit.json' with { type: 'json' };
import left_upper_conjtrans_unit from './fixtures/left_upper_conjtrans_unit.json' with { type: 'json' };
import left_lower_notrans_unit from './fixtures/left_lower_notrans_unit.json' with { type: 'json' };
import left_lower_trans_unit from './fixtures/left_lower_trans_unit.json' with { type: 'json' };
import left_lower_conjtrans_unit from './fixtures/left_lower_conjtrans_unit.json' with { type: 'json' };
import right_upper_notrans_unit from './fixtures/right_upper_notrans_unit.json' with { type: 'json' };
import right_upper_trans_unit from './fixtures/right_upper_trans_unit.json' with { type: 'json' };
import right_upper_conjtrans_unit from './fixtures/right_upper_conjtrans_unit.json' with { type: 'json' };
import right_lower_notrans_unit from './fixtures/right_lower_notrans_unit.json' with { type: 'json' };
import right_lower_trans_unit from './fixtures/right_lower_trans_unit.json' with { type: 'json' };
import right_lower_conjtrans_unit from './fixtures/right_lower_conjtrans_unit.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import complex_alpha from './fixtures/complex_alpha.json' with { type: 'json' };
import complex_alpha_nonidentity from './fixtures/complex_alpha_nonidentity.json' with { type: 'json' };
import _3x2_left_upper_notrans from './fixtures/3x2_left_upper_notrans.json' with { type: 'json' };
import right_upper_conjtrans_alpha from './fixtures/right_upper_conjtrans_alpha.json' with { type: 'json' };
import right_lower_trans_alpha from './fixtures/right_lower_trans_alpha.json' with { type: 'json' };
// HELPERS //

function assertClose( actual, expected, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= 1e-14, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, msg ) {
	var i;
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], msg + '[' + i + ']' );
	}
}

/**
* Extract M x N complex matrix from interleaved flat array with given strides.
* Returns just the M*N complex values (2*M*N doubles) in column-major order.
*/
function extractCMatrix( arr, M, N, sb1, sb2, offsetB ) {
	var out = [];
	var ib;
	var i;
	var j;
	var v;
	v = reinterpret( arr, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			ib = offsetB * 2 + 2 * ( i * sb1 + j * sb2 );
			out.push( v[ ib ] );
			out.push( v[ ib + 1 ] );
		}
	}
	return out;
}

/**
* Create upper triangular 2x2 complex A: [(2,1), (3,1); 0, (4,2)] col-major.
*/
function upperA() {
	return new Complex128Array( [ 2, 1, 0, 0, 3, 1, 4, 2 ] );
}

/**
* Create lower triangular 2x2 complex A: [(2,1), 0; (3,1), (4,2)] col-major.
*/
function lowerA() {
	return new Complex128Array( [ 2, 1, 3, 1, 0, 0, 4, 2 ] );
}

/**
* Create standard 2x2 complex B: [(1,0),(0,1); (0,1),(1,0)] col-major.
*/
function stdB() {
	return new Complex128Array( [ 1, 0, 0, 1, 0, 1, 1, 0 ] );
}

/**
* Create unit-diagonal upper A (diagonal ignored): col-major [(99,99),0; (3,1),(99,99)].
*/
function upperUnitA() {
	return new Complex128Array( [ 99, 99, 0, 0, 3, 1, 99, 99 ] );
}

/**
* Create unit-diagonal lower A (diagonal ignored): col-major [(99,99),(3,1); 0,(99,99)].
*/
function lowerUnitA() {
	return new Complex128Array( [ 99, 99, 3, 1, 0, 0, 99, 99 ] );
}

// TESTS //

test( 'ztrsm: main export is a function', function t() {
	assert.strictEqual( typeof ztrsm, 'function' );
});

test( 'ztrsm: attached to the main export is an `ndarray` method', function t() {
	assert.strictEqual( typeof ztrsm.ndarray, 'function' );
});

// ========================================================================
// 12 tests: all side x uplo x trans combinations, non-unit diagonal
// ========================================================================

test( 'ztrsm: left, upper, no-transpose, non-unit', function t() {
	var tc = left_upper_notrans_nonunit;
	var result = base( 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), upperA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: left, upper, transpose, non-unit', function t() {
	var tc = left_upper_trans_nonunit;
	var result = base( 'left', 'upper', 'transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), upperA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: left, upper, conj-transpose, non-unit', function t() {
	var tc = left_upper_conjtrans_nonunit;
	var result = base( 'left', 'upper', 'conjugate-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), upperA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: left, lower, no-transpose, non-unit', function t() {
	var tc = left_lower_notrans_nonunit;
	var result = base( 'left', 'lower', 'no-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), lowerA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: left, lower, transpose, non-unit', function t() {
	var tc = left_lower_trans_nonunit;
	var result = base( 'left', 'lower', 'transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), lowerA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: left, lower, conj-transpose, non-unit', function t() {
	var tc = left_lower_conjtrans_nonunit;
	var result = base( 'left', 'lower', 'conjugate-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), lowerA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: right, upper, no-transpose, non-unit', function t() {
	var tc = right_upper_notrans_nonunit;
	var result = base( 'right', 'upper', 'no-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), upperA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: right, upper, transpose, non-unit', function t() {
	var tc = right_upper_trans_nonunit;
	var result = base( 'right', 'upper', 'transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), upperA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: right, upper, conj-transpose, non-unit', function t() {
	var tc = right_upper_conjtrans_nonunit;
	var result = base( 'right', 'upper', 'conjugate-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), upperA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: right, lower, no-transpose, non-unit', function t() {
	var tc = right_lower_notrans_nonunit;
	var result = base( 'right', 'lower', 'no-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), lowerA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: right, lower, transpose, non-unit', function t() {
	var tc = right_lower_trans_nonunit;
	var result = base( 'right', 'lower', 'transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), lowerA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: right, lower, conj-transpose, non-unit', function t() {
	var tc = right_lower_conjtrans_nonunit;
	var result = base( 'right', 'lower', 'conjugate-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), lowerA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

// ========================================================================
// 12 tests: all side x uplo x trans combinations, unit diagonal
// ========================================================================

test( 'ztrsm: left, upper, no-transpose, unit', function t() {
	var tc = left_upper_notrans_unit;
	var result = base( 'left', 'upper', 'no-transpose', 'unit', 2, 2, new Complex128( 1, 0 ), upperUnitA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: left, upper, transpose, unit', function t() {
	var tc = left_upper_trans_unit;
	var result = base( 'left', 'upper', 'transpose', 'unit', 2, 2, new Complex128( 1, 0 ), upperUnitA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: left, upper, conj-transpose, unit', function t() {
	var tc = left_upper_conjtrans_unit;
	var result = base( 'left', 'upper', 'conjugate-transpose', 'unit', 2, 2, new Complex128( 1, 0 ), upperUnitA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: left, lower, no-transpose, unit', function t() {
	var tc = left_lower_notrans_unit;
	var result = base( 'left', 'lower', 'no-transpose', 'unit', 2, 2, new Complex128( 1, 0 ), lowerUnitA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: left, lower, transpose, unit', function t() {
	var tc = left_lower_trans_unit;
	var result = base( 'left', 'lower', 'transpose', 'unit', 2, 2, new Complex128( 1, 0 ), lowerUnitA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: left, lower, conj-transpose, unit', function t() {
	var tc = left_lower_conjtrans_unit;
	var result = base( 'left', 'lower', 'conjugate-transpose', 'unit', 2, 2, new Complex128( 1, 0 ), lowerUnitA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: right, upper, no-transpose, unit', function t() {
	var tc = right_upper_notrans_unit;
	var result = base( 'right', 'upper', 'no-transpose', 'unit', 2, 2, new Complex128( 1, 0 ), upperUnitA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: right, upper, transpose, unit', function t() {
	var tc = right_upper_trans_unit;
	var result = base( 'right', 'upper', 'transpose', 'unit', 2, 2, new Complex128( 1, 0 ), upperUnitA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: right, upper, conj-transpose, unit', function t() {
	var tc = right_upper_conjtrans_unit;
	var result = base( 'right', 'upper', 'conjugate-transpose', 'unit', 2, 2, new Complex128( 1, 0 ), upperUnitA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: right, lower, no-transpose, unit', function t() {
	var tc = right_lower_notrans_unit;
	var result = base( 'right', 'lower', 'no-transpose', 'unit', 2, 2, new Complex128( 1, 0 ), lowerUnitA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: right, lower, transpose, unit', function t() {
	var tc = right_lower_trans_unit;
	var result = base( 'right', 'lower', 'transpose', 'unit', 2, 2, new Complex128( 1, 0 ), lowerUnitA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: right, lower, conj-transpose, unit', function t() {
	var tc = right_lower_conjtrans_unit;
	var result = base( 'right', 'lower', 'conjugate-transpose', 'unit', 2, 2, new Complex128( 1, 0 ), lowerUnitA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

// ========================================================================
// Edge case tests
// ========================================================================

test( 'ztrsm: alpha=0 zeros B', function t() {
	var tc = alpha_zero;
	var result = base( 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, new Complex128( 0, 0 ), upperA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: complex alpha=(0,1) with identity A', function t() {
	var tc = complex_alpha;
	var A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	var B = new Complex128Array( [ 1, 0, 0, 1, 2, 0, 0, 2 ] );
	var result = base( 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, new Complex128( 0, 1 ), A, 1, 2, 0, B, 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: complex alpha=(2,-1) with non-identity A', function t() {
	var tc = complex_alpha_nonidentity;
	var result = base( 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, new Complex128( 2, -1 ), upperA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: M=0 quick return (B unchanged)', function t() {
	var B = new Complex128Array( [ 99, 99 ] );
	var result = base( 'left', 'upper', 'no-transpose', 'non-unit', 0, 2, new Complex128( 1, 0 ), upperA(), 1, 2, 0, B, 1, 1, 0 );
	assert.strictEqual( result, B );
	var v = reinterpret( B, 0 );
	assert.strictEqual( v[ 0 ], 99 );
	assert.strictEqual( v[ 1 ], 99 );
});

test( 'ztrsm: N=0 quick return (B unchanged)', function t() {
	var B = new Complex128Array( [ 99, 99 ] );
	var result = base( 'left', 'upper', 'no-transpose', 'non-unit', 2, 0, new Complex128( 1, 0 ), upperA(), 1, 2, 0, B, 1, 1, 0 );
	assert.strictEqual( result, B );
	var v = reinterpret( B, 0 );
	assert.strictEqual( v[ 0 ], 99 );
	assert.strictEqual( v[ 1 ], 99 );
});

test( 'ztrsm: 3x2 left, upper, no-transpose', function t() {
	var tc = _3x2_left_upper_notrans;
	// A 3x3 upper: [(1,1), (2,0), (0,1); 0, (3,-1), (1,2); 0, 0, (2,0)] col-major
	var A = new Complex128Array( [
		1, 1, 0, 0, 0, 0,   // col 0
		2, 0, 3, -1, 0, 0,  // col 1
		0, 1, 1, 2, 2, 0    // col 2
	] );
	var B = new Complex128Array( [
		1, 0, 0, 1, 2, -1,   // col 0
		-1, 1, 3, 0, 0, 0    // col 1
	] );
	var result = base( 'left', 'upper', 'no-transpose', 'non-unit', 3, 2, new Complex128( 1, 0 ), A, 1, 3, 0, B, 1, 3, 0 );
	assertArrayClose( extractCMatrix( result, 3, 2, 1, 3, 0 ), tc.b, 'b' );
});

test( 'ztrsm: right, upper, conj-transpose with complex alpha', function t() {
	var tc = right_upper_conjtrans_alpha;
	var result = base( 'right', 'upper', 'conjugate-transpose', 'non-unit', 2, 2, new Complex128( 2, -1 ), upperA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: right, lower, transpose with complex alpha', function t() {
	var tc = right_lower_trans_alpha;
	var result = base( 'right', 'lower', 'transpose', 'non-unit', 2, 2, new Complex128( 2, -1 ), lowerA(), 1, 2, 0, stdB(), 1, 2, 0 );
	assertArrayClose( extractCMatrix( result, 2, 2, 1, 2, 0 ), tc.b, 'b' );
});

test( 'ztrsm: returns the B array', function t() {
	var B = stdB();
	var result = base( 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), upperA(), 1, 2, 0, B, 1, 2, 0 );
	assert.strictEqual( result, B );
});

// NDARRAY VALIDATION TESTS //

var ndarray = base;

test( 'ndarray: throws TypeError for invalid side', function t() {
	assert.throws( function f() {
		ndarray( 'invalid', 'upper', 'no-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), upperA(), 1, 2, 0, stdB(), 1, 2, 0 );
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid uplo', function t() {
	assert.throws( function f() {
		ndarray( 'left', 'invalid', 'no-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), upperA(), 1, 2, 0, stdB(), 1, 2, 0 );
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid transa', function t() {
	assert.throws( function f() {
		ndarray( 'left', 'upper', 'invalid', 'non-unit', 2, 2, new Complex128( 1, 0 ), upperA(), 1, 2, 0, stdB(), 1, 2, 0 );
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid diag', function t() {
	assert.throws( function f() {
		ndarray( 'left', 'upper', 'no-transpose', 'invalid', 2, 2, new Complex128( 1, 0 ), upperA(), 1, 2, 0, stdB(), 1, 2, 0 );
	}, TypeError );
});

test( 'ndarray: throws RangeError for negative M', function t() {
	assert.throws( function f() {
		ndarray( 'left', 'upper', 'no-transpose', 'non-unit', -1, 2, new Complex128( 1, 0 ), upperA(), 1, 2, 0, stdB(), 1, 2, 0 );
	}, RangeError );
});

test( 'ndarray: throws RangeError for negative N', function t() {
	assert.throws( function f() {
		ndarray( 'left', 'upper', 'no-transpose', 'non-unit', 2, -1, new Complex128( 1, 0 ), upperA(), 1, 2, 0, stdB(), 1, 2, 0 );
	}, RangeError );
});
