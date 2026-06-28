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

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dlaqz4 from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Builds a Hessenberg-triangular pencil `(A, B)` of order `N` as Float64Arrays in column-major layout.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Object} pencil `{ A, B }`
*/
function buildPencil( N ) {
	var out;
	var A;
	var B;
	var i;
	var j;
	A = new Float64Array( N * N );
	B = new Float64Array( N * N );
	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= N; i++ ) {
			if ( i <= j + 1 ) {
				A[ ( i - 1 ) + ( ( j - 1 ) * N ) ] = 1.0 + ( 0.1 * ( i + ( 2 * j ) ) ) + ( 0.03 * i * j );
			}
			if ( i <= j ) {
				B[ ( i - 1 ) + ( ( j - 1 ) * N ) ] = 2.0 + ( 0.2 * ( j - i ) ) + ( 0.05 * j );
			}
		}
	}
	out = {
		'A': A,
		'B': B
	};
	return out;
}

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var pencil;
	var WORK;
	var QC;
	var ZC;
	var nb;
	var SR;
	var SI;
	var SS;
	var Q;
	var Z;
	var k;
	nb = 4;
	pencil = buildPencil( N );
	SR = new Float64Array( [ 1.5, 1.5 ] );
	SI = new Float64Array( [ 0.3, -0.3 ] );
	SS = new Float64Array( [ 1.0, 1.0 ] );
	Q = new Float64Array( N * N );
	Z = new Float64Array( N * N );
	QC = new Float64Array( N * N );
	ZC = new Float64Array( N * N );
	WORK = new Float64Array( N * nb );
	for ( k = 0; k < N; k++ ) {
		Q[ k + ( k * N ) ] = 1.0;
		Z[ k + ( k * N ) ] = 1.0;
	}
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var info;
		var i;
		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			info = dlaqz4( true, true, true, N, 0, N - 1, 2, nb, SR, 1, 0, SI, 1, 0, SS, 1, 0, pencil.A, 1, N, 0, pencil.B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, QC, 1, N, 0, ZC, 1, N, 0, WORK, 1, 0 );
			if ( isnan( info ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( info ) ) {
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
	var min;
	var max;
	var f;
	var i;
	min = 1;
	max = 2;
	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:ndarray:len=%d', pkg, len ), f );
	}
}

main();
