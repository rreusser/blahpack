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
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsytrf from './../../dsytrf/lib/ndarray.js';
import dsytrs from './../../dsytrs/lib/ndarray.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import dsyrfs from './../lib/ndarray.js';


// VARIABLES //

const pkg = pkgJson.name;
/** @type {{ dtype: 'float64' }} */
const options = {
	'dtype': 'float64'
};


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - problem size
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	const A = uniform( N * N, -10.0, 10.0, options );
	const AF = uniform( N * N, -10.0, 10.0, options );
	const IPIV = new Int32Array( N * N );
	const B = uniform( N * N, -10.0, 10.0, options );
	const X = uniform( N * N, -10.0, 10.0, options );
	const FERR = uniform( N * N, -10.0, 10.0, options );
	const BERR = uniform( N * N, -10.0, 10.0, options );
	const WORK = uniform( (4 * N * N) + (64 * N), -10.0, 10.0, options );
	const IWORK = new Int32Array( (4 * N * N) + (64 * N) );

	// Structured inputs: Refinement of a symmetric/Hermitian indefinite solve (xSYTRF/xHETRF + xSYTRS/xHETRS).
	AF.set( A );
	const setupWork = new Float64Array( 256 * N );
	dsytrf( 'upper', N, AF, 1, N, 0, IPIV, 1, 0, setupWork, 1, 0 );
	X.set( B );
	dsytrs( 'upper', N, N, AF, 1, N, 0, IPIV, 1, 0, X, 1, N, 0 );
	const XInit = X.slice();
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		let out, i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			// Restore the structured inputs the routine overwrites:
			X.set( XInit );
			out = dsyrfs( 'upper', N, N, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
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
	let N, f, i;

	const min = 1; // 10^min
	const max = 2; // 10^max

	for ( i = min; i <= max; i++ ) {
		N = pow( 10, i );
		f = createBenchmark( N );
		bench( format( '%s:ndarray:N=%d', pkg, N ), f );
	}
}

main();
