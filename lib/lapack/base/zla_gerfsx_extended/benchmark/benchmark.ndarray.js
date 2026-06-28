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

/* eslint-disable camelcase */

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zgetrf from './../../zgetrf/lib/base.js';
import zgetrs from './../../zgetrs/lib/base.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zla_gerfsx_extended from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Builds a diagonally dominant complex `N`-by-`N` matrix.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Complex128Array} complex matrix
*/
function buildMatrix( N ) {
	var A = new Complex128Array( N * N );
	var v = new Float64Array( A.buffer );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			v[ 2 * ( ( j * N ) + i ) ] = ( i === j ) ? ( 2.0 * N ) : 0.1;
			v[ ( 2 * ( ( j * N ) + i ) ) + 1 ] = 0.01;
		}
	}
	return A;
}

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var BERR_OUT;
	var ERRS_C;
	var ERRS_N;
	var Y_TAIL;
	var IPIV;
	var afvi;
	var AYB;
	var avi;
	var RES;
	var AF;
	var bv;
	var DY;
	var Y0;
	var A;
	var B;
	var C;
	var k;

	BERR_OUT = new Float64Array( 1 );
	ERRS_C = new Float64Array( 3 );
	ERRS_N = new Float64Array( 3 );
	Y_TAIL = new Complex128Array( N );
	IPIV = new Int32Array( N );
	A = buildMatrix( N );
	AF = new Complex128Array( N * N );
	afvi = new Float64Array( AF.buffer );
	avi = new Float64Array( A.buffer );
	AYB = new Float64Array( N );
	B = new Complex128Array( N );
	bv = new Float64Array( B.buffer );
	C = new Float64Array( N );
	DY = new Complex128Array( N );
	RES = new Complex128Array( N );
	Y0 = new Complex128Array( N );
	for ( k = 0; k < 2 * N * N; k++ ) {
		afvi[ k ] = avi[ k ];
	}
	for ( k = 0; k < N; k++ ) {
		C[ k ] = 1.0;
		bv[ 2 * k ] = 1.0;
		bv[ ( 2 * k ) + 1 ] = 0.0;
	}
	zgetrf( N, N, AF, 1, N, 0, IPIV, 1, 0 );

	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var y0v = new Float64Array( Y0.buffer );
		var out;
		var i;
		var j;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			for ( j = 0; j < 2 * N; j++ ) {
				y0v[ j ] = bv[ j ];
			}
			zgetrs( 'no-transpose', N, 1, AF, 1, N, 0, IPIV, 1, 0, Y0, 1, N, 0 );
			out = zla_gerfsx_extended( 2, 'no-transpose', N, 1, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y0, 1, N, 0, BERR_OUT, 1, 0, 2, ERRS_N, 1, 1, 0, ERRS_C, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, Y_TAIL, 1, 0, 1e-3, 10, 0.5, 0.25, false );
			if ( isnan( out ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( out ) ) {
			b.fail( 'should not return NaN' );
		}
		b.pass( 'benchmark finished' );
		b.end();
	}
}


// MAIN //

/**
* Main execution sequence.
*
* @private
*/
function main() {
	var len;
	var mn;
	var mx;
	var f;
	var i;

	mn = 1;
	mx = 2;

	for ( i = mn; i <= mx; i++ ) {
		len = pow( 2, i + 2 );
		f = createBenchmark( len );
		bench( format( '%s:ndarray:N=%d', pkg, len ), f );
	}
}

main();
