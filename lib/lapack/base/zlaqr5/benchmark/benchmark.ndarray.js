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
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import zlaqr5 from './../lib/ndarray.js';


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
	const s = uniform( N * N, -10.0, 10.0, options );
	const H = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const Z = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const V = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const U = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const WV = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const WH = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		let i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			zlaqr5( true, true, N, N, N, N, N, s, 1, 0, H, 1, N, 0, N, N, Z, 1, N, 0, V, 1, N, 0, U, 1, N, 0, N, WV, 1, N, 0, N, WH, 1, N, 0 );
		}
		b.toc();
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
