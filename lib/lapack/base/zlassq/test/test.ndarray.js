/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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
import zlassq from './../lib/index.js';
import base from './../lib/ndarray.js';

function c128( arr ) {
	if ( arr instanceof Float64Array ) {
		return new Complex128Array( arr );
	}
	return new Complex128Array( arr );
}

// FIXTURES //

import zlassq_basic from './fixtures/zlassq_basic.json' with { type: 'json' };
import zlassq_accumulate from './fixtures/zlassq_accumulate.json' with { type: 'json' };
import zlassq_n_zero from './fixtures/zlassq_n_zero.json' with { type: 'json' };
import zlassq_stride from './fixtures/zlassq_stride.json' with { type: 'json' };
import zlassq_imag from './fixtures/zlassq_imag.json' with { type: 'json' };
import zlassq_big from './fixtures/zlassq_big.json' with { type: 'json' };
import zlassq_small from './fixtures/zlassq_small.json' with { type: 'json' };
import zlassq_big_normal from './fixtures/zlassq_big_normal.json' with { type: 'json' };
import zlassq_small_normal from './fixtures/zlassq_small_normal.json' with { type: 'json' };
import zlassq_neg_stride from './fixtures/zlassq_neg_stride.json' with { type: 'json' };
import zlassq_big_existing from './fixtures/zlassq_big_existing.json' with { type: 'json' };
import zlassq_small_existing from './fixtures/zlassq_small_existing.json' with { type: 'json' };
import zlassq_pure_small from './fixtures/zlassq_pure_small.json' with { type: 'json' };
import zlassq_scale_zero from './fixtures/zlassq_scale_zero.json' with { type: 'json' };
import zlassq_big_existing_scale_gt1 from './fixtures/zlassq_big_existing_scale_gt1.json' with { type: 'json' };
import zlassq_small_existing_scale_lt1 from './fixtures/zlassq_small_existing_scale_lt1.json' with { type: 'json' };
// HELPERS //

function assertClose( actual, expected, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= 1e-14, msg + ': expected ' + expected + ', got ' + actual );
}

// TESTS //

test( 'zlassq: main export is a function', function t() {
	assert.strictEqual( typeof zlassq, 'function' );
});

test( 'zlassq: attached to the main export is an `ndarray` method', function t() {
	assert.strictEqual( typeof zlassq.ndarray, 'function' );
});

test( 'zlassq: basic accumulation from zero', function t() {
	var tc = zlassq_basic;
	// x = [(3,4), (1,2)] interleaved: [3,4,1,2]
	var x = c128( new Float64Array( [ 3, 4, 1, 2 ] ) );
	var result = base( 2, x, 1, 0, 1.0, 0.0 );
	assertClose( result.scl, tc.scl, 'zlassq_basic scl' );
	assertClose( result.sumsq, tc.sumsq, 'zlassq_basic sumsq' );
});

test( 'zlassq: accumulate onto existing sum', function t() {
	var tc = zlassq_accumulate;
	// x = [(1,0)]
	var x = c128( new Float64Array( [ 1, 0 ] ) );
	var result = base( 1, x, 1, 0, 2.0, 3.0 );
	assertClose( result.scl, tc.scl, 'zlassq_accumulate scl' );
	assertClose( result.sumsq, tc.sumsq, 'zlassq_accumulate sumsq' );
});

test( 'zlassq: N=0 quick return', function t() {
	var tc = zlassq_n_zero;
	var x = c128( new Float64Array( [ 99, 99 ] ) );
	var result = base( 0, x, 1, 0, 2.0, 5.0 );
	assertClose( result.scl, tc.scl, 'zlassq_n_zero scl' );
	assertClose( result.sumsq, tc.sumsq, 'zlassq_n_zero sumsq' );
});

test( 'zlassq: stride=2', function t() {
	var tc = zlassq_stride;
	// x = [(3,0), (99,99), (4,0)] interleaved: [3,0, 99,99, 4,0]
	// stride=2 means skip every other complex element
	var x = c128( new Float64Array( [ 3, 0, 99, 99, 4, 0 ] ) );
	var result = base( 2, x, 2, 0, 1.0, 0.0 );
	assertClose( result.scl, tc.scl, 'zlassq_stride scl' );
	assertClose( result.sumsq, tc.sumsq, 'zlassq_stride sumsq' );
});

test( 'zlassq: purely imaginary', function t() {
	var tc = zlassq_imag;
	// x = [(0,5)]
	var x = c128( new Float64Array( [ 0, 5 ] ) );
	var result = base( 1, x, 1, 0, 1.0, 0.0 );
	assertClose( result.scl, tc.scl, 'zlassq_imag scl' );
	assertClose( result.sumsq, tc.sumsq, 'zlassq_imag sumsq' );
});

test( 'zlassq: very large values (overflow path, abig)', function t() {
	var tc = zlassq_big;
	var x = c128( new Float64Array( [ 1e300, 1e300, 2e300, 0 ] ) );
	var result = base( 2, x, 1, 0, 1.0, 0.0 );
	assertClose( result.scl, tc.scl, 'zlassq_big scl' );
	assertClose( result.sumsq, tc.sumsq, 'zlassq_big sumsq' );
});

test( 'zlassq: very small values (underflow path, asml)', function t() {
	var tc = zlassq_small;
	var x = c128( new Float64Array( [ 1e-300, 1e-300, 2e-300, 0 ] ) );
	var result = base( 2, x, 1, 0, 1.0, 0.0 );
	assertClose( result.scl, tc.scl, 'zlassq_small scl' );
	assertClose( result.sumsq, tc.sumsq, 'zlassq_small sumsq' );
});

test( 'zlassq: big + normal values (abig + amed combination)', function t() {
	var tc = zlassq_big_normal;
	var x = c128( new Float64Array( [ 1e300, 0, 1, 0 ] ) );
	var result = base( 2, x, 1, 0, 1.0, 0.0 );
	assertClose( result.scl, tc.scl, 'zlassq_big_normal scl' );
	assertClose( result.sumsq, tc.sumsq, 'zlassq_big_normal sumsq' );
});

test( 'zlassq: small + normal values (asml + amed combination)', function t() {
	var tc = zlassq_small_normal;
	var x = c128( new Float64Array( [ 1e-300, 0, 1, 0 ] ) );
	var result = base( 2, x, 1, 0, 1.0, 0.0 );
	assertClose( result.scl, tc.scl, 'zlassq_small_normal scl' );
	assertClose( result.sumsq, tc.sumsq, 'zlassq_small_normal sumsq' );
});

test( 'zlassq: negative stride', function t() {
	var tc = zlassq_neg_stride;
	// With stride=-1, sx=-2, the code adjusts ix = offset - (N-1)*sx
	// offset=0, N=2: ix = 0 - 1*(-2) = 2. Reads [2],[3] then [0],[1]
	var x = c128( new Float64Array( [ 3, 0, 4, 0 ] ) );
	var result = base( 2, x, -1, 0, 1.0, 0.0 );
	assertClose( result.scl, tc.scl, 'zlassq_neg_stride scl' );
	assertClose( result.sumsq, tc.sumsq, 'zlassq_neg_stride sumsq' );
});

test( 'zlassq: big existing sum + big values', function t() {
	var tc = zlassq_big_existing;
	var x = c128( new Float64Array( [ 1e300, 0 ] ) );
	var result = base( 1, x, 1, 0, 1e200, 1.0 );
	assertClose( result.scl, tc.scl, 'zlassq_big_existing scl' );
	assertClose( result.sumsq, tc.sumsq, 'zlassq_big_existing sumsq' );
});

test( 'zlassq: small existing sum + small values', function t() {
	var tc = zlassq_small_existing;
	var x = c128( new Float64Array( [ 1e-300, 0 ] ) );
	var result = base( 1, x, 1, 0, 1e-200, 1.0 );
	assertClose( result.scl, tc.scl, 'zlassq_small_existing scl' );
	assertClose( result.sumsq, tc.sumsq, 'zlassq_small_existing sumsq' );
});

test( 'zlassq: pure small values only (asml only, no amed)', function t() {
	var tc = zlassq_pure_small;
	var x = c128( new Float64Array( [ 1e-300, 2e-300 ] ) );
	var result = base( 1, x, 1, 0, 1.0, 0.0 );
	assertClose( result.scl, tc.scl, 'zlassq_pure_small scl' );
	assertClose( result.sumsq, tc.sumsq, 'zlassq_pure_small sumsq' );
});

test( 'zlassq: scale=0 input', function t() {
	var tc = zlassq_scale_zero;
	var x = c128( new Float64Array( [ 3, 4 ] ) );
	var result = base( 1, x, 1, 0, 0.0, 0.0 );
	assertClose( result.scl, tc.scl, 'zlassq_scale_zero scl' );
	assertClose( result.sumsq, tc.sumsq, 'zlassq_scale_zero sumsq' );
});

test( 'zlassq: big existing sum with scale > 1', function t() {
	var tc = zlassq_big_existing_scale_gt1;
	var x = c128( new Float64Array( [ 1e300, 0 ] ) );
	var result = base( 1, x, 1, 0, 2.0, 1e308 );
	assertClose( result.scl, tc.scl, 'zlassq_big_existing_scale_gt1 scl' );
	assertClose( result.sumsq, tc.sumsq, 'zlassq_big_existing_scale_gt1 sumsq' );
});

test( 'zlassq: small existing sum with scale < 1', function t() {
	var tc = zlassq_small_existing_scale_lt1;
	var x = c128( new Float64Array( [ 1e-300, 0 ] ) );
	var result = base( 1, x, 1, 0, 0.5, 1e-300 );
	assertClose( result.scl, tc.scl, 'zlassq_small_existing_scale_lt1 scl' );
	assertClose( result.sumsq, tc.sumsq, 'zlassq_small_existing_scale_lt1 sumsq' );
});

test( 'zlassq: scale=0 with nonzero sumsq resets', function t() {
	// scale=0, sumsq=5 → should reset to scale=1, sumsq=0, then accumulate x
	// This exercises lines 69-72 (scale===0 reset)
	var x = c128( new Float64Array( [ 3, 4 ] ) ); // |z|^2 = 9+16 = 25
	var result = base( 1, x, 1, 0, 0.0, 5.0 );
	// After reset: scale=1, sumsq=0. Then accumulates 25 in amed.
	assert.strictEqual( result.scl, 1.0 );
	assertClose( result.sumsq, 25.0, 'sumsq should be 25' );
});

test( 'zlassq: big existing sum with scale <= 1', function t() {
	// Need scale*sqrt(sumsq) > TBIG with scale <= 1
	// scale=1, sumsq=1e300 → ax = 1 * sqrt(1e300) = 1e150 > TBIG (~2.5e146)
	// This exercises lines 131-133 (scale <= 1 in big existing sum path)
	var x = c128( new Float64Array( [ 1, 0 ] ) );
	var result = base( 1, x, 1, 0, 1.0, 1e300 );
	// Should produce a valid scaled result
	assert.ok( result.scl > 0, 'scl should be positive' );
	assert.ok( result.sumsq > 0, 'sumsq should be positive' );
	assert.ok( isFinite( result.scl ), 'scl should be finite' );
	assert.ok( isFinite( result.sumsq ), 'sumsq should be finite' );
});

test( 'zlassq: small existing sum with scale >= 1', function t() {
	// Need scale*sqrt(sumsq) < TSML with scale >= 1 and notbig=true
	// scale=1, sumsq=1e-320 → ax = sqrt(1e-320) = 1e-160 < TSML (~1.5e-154)
	// x value must be small to keep notbig=true
	var x = c128( new Float64Array( [ 1e-200, 0 ] ) );
	var result = base( 1, x, 1, 0, 1.0, 1e-320 );
	assert.ok( result.scl > 0, 'scl should be positive' );
	assert.ok( result.sumsq > 0, 'sumsq should be positive' );
});

test( 'zlassq: asml > amed combination path', function t() {
	// Need both asml>0 and amed>0, with sqrt(asml_accum)/SSML > sqrt(amed_accum)
	// This simplifies to sum(x_small^2) > sum(x_med^2)
	// Use 5 small complex values (re=im=TSML*0.99) and 1 medium (re=TSML*1.01)
	// sum(x_small^2) = 10*(TSML*0.99)^2 ≈ 9.8*TSML^2
	// sum(x_med^2)   =  1*(TSML*1.01)^2 ≈ 1.02*TSML^2
	// → asml ≈ 3.1*TSML > amed ≈ 1.01*TSML
	var TSML = Math.pow( 2, -511 );
	var small = TSML * 0.99;
	var med = TSML * 1.01;
	var x = c128( new Float64Array( [
		small, small,
		small, small,
		small, small,
		small, small,
		small, small,
		med, 0
	] ) );
	var result = base( 6, x, 1, 0, 1.0, 0.0 );
	assert.ok( result.scl > 0, 'scl should be positive' );
	assert.ok( result.sumsq > 0, 'sumsq should be positive' );
	assert.ok( isFinite( result.scl * Math.sqrt( result.sumsq ) ), 'norm should be finite' );
});

test( 'zlassq: NaN scale quick return', function t() {
	var x = c128( new Float64Array( [ 1, 2 ] ) );
	var result = base( 1, x, 1, 0, NaN, 1.0 );
	assert.ok( result.scl !== result.scl, 'zlassq NaN scale returns NaN scl' );
});

test( 'zlassq: NaN sumsq quick return', function t() {
	var x = c128( new Float64Array( [ 1, 2 ] ) );
	var result = base( 1, x, 1, 0, 1.0, NaN );
	assert.ok( result.sumsq !== result.sumsq, 'zlassq NaN sumsq returns NaN sumsq' );
});
