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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpptrf from './../../zpptrf/lib/ndarray.js';
import zpptrs from './../../zpptrs/lib/ndarray.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import zpprfs from './../lib/zpprfs.js';


// VARIABLES //

const pkg = pkgJson.name;
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
	const AP = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const AFP = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const B = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const X = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const FERR = uniform( N * N, -10.0, 10.0, options );
	const BERR = uniform( N * N, -10.0, 10.0, options );
	const WORK = new Complex128Array( uniform( 2 * ( (4 * N * N) + (64 * N) ), -10.0, 10.0, options ) );
	const RWORK = uniform( (4 * N * N) + (64 * N), -10.0, 10.0, options );
	let j;

	// Structured inputs: Refinement of a packed Cholesky solve (xPPTRF + xPPTRS).
	const APView = reinterpret( AP, 0 );
	for ( j = 0; j < N; j++ ) {
		APView[ 2 * ( j + ( ( j * ( j + 1 ) ) / 2 ) ) ] += 20.0 * N;
		APView[ ( 2 * ( j + ( ( j * ( j + 1 ) ) / 2 ) ) ) + 1 ] = 0.0;
	}
	reinterpret( AFP, 0 ).set( reinterpret( AP, 0 ) );
	zpptrf( 'upper', N, AFP, 1, 0 );
	reinterpret( X, 0 ).set( reinterpret( B, 0 ) );
	zpptrs( 'upper', N, N, AFP, 1, 0, X, 1, N, 0 );
	const XView = reinterpret( X, 0 );
	const XInit = XView.slice();
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
			XView.set( XInit );
			out = zpprfs( 'column-major', 'upper', N, N, AP, AFP, B, N, X, N, FERR, 1, BERR, 1, WORK, RWORK );
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
		bench( format( '%s:N=%d', pkg, N ), f );
	}
}

main();
