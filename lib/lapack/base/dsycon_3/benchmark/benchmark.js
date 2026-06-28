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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dsycon3 from './../lib/dsycon_3.js';


// VARIABLES //

var options = {
	'dtype': 'float64'
};


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var rcond;
	var iwork;
	var ipiv;
	var work;
	var A;
	var e;
	var i;

	A = uniform( N * N, -1.0, 1.0, options );

	// Make positive-definite-ish to avoid singular factorizations.
	for ( i = 0; i < N; i += 1 ) {
		A[ ( i * N ) + i ] = ( N * 2 ) + 1;
	}
	e = new Float64Array( N );
	ipiv = new Int32Array( N );
	for ( i = 0; i < N; i += 1 ) {
		ipiv[ i ] = i;
	}
	work = new Float64Array( 2 * N );
	iwork = new Int32Array( N );
	rcond = new Float64Array( 1 );
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var info;
		var k;

		b.tic();
		for ( k = 0; k < b.iterations; k += 1 ) {
			info = dsycon3( 'column-major', 'upper', N, A, N, e, 1, ipiv, 1, 1.0, rcond, work, 1, iwork, 1 );
			if ( isnan( rcond[ 0 ] ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( info !== 0 ) {
			b.fail( 'unexpected info' );
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

	min = 1; // 10^min
	max = 2; // 10^max

	for ( i = min; i <= max; i += 1 ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:N=%d', pkg, len ), f );
	}
}

main();
