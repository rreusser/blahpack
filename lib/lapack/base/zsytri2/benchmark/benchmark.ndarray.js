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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zsytri2 from './../lib/ndarray.js';


// VARIABLES //

// Block size threshold; matches the dispatch constant in `lib/base.js`.
var NBMAX = 32;


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var ldwork;
	var work;
	var ipiv;
	var A;
	var i;

	ipiv = new Int32Array( N );
	if ( NBMAX >= N ) {
		work = new Complex128Array( N );
	} else {
		ldwork = N + NBMAX + 1;
		work = new Complex128Array( ldwork * ( NBMAX + 3 ) );
	}
	A = new Complex128Array( N * N );
	for ( i = 0; i < N; i++ ) {
		A.set( [ 1.0, 0.0 ], i + ( i * N ) );
		ipiv[ i ] = i;
	}
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var y;
		var j;

		b.tic();
		for ( j = 0; j < b.iterations; j++ ) {
			A.set( [ 1.0 + ( j * 1e-12 ), 0.0 ], 0 );
			y = zsytri2( 'lower', N, A, 1, N, 0, ipiv, 1, 0, work, 1, 0 );
			if ( isnan( y ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( y ) ) {
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
	var f;
	var i;

	for ( i = 1; i <= 2; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:ndarray:N=%d', pkg, len ), f );
	}
}

main();
