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
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import dlaed2 from './../lib/ndarray.js';


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
	const d = uniform( N * N, -10.0, 10.0, options );
	const Q = uniform( N * N, -10.0, 10.0, options );
	const INDXQ = new Int32Array( N * N );
	const zInit = uniform( N * N, -10.0, 10.0, options );
	const z = new Float64Array( zInit.length );
	const DLAMBDAInit = uniform( N * N, -10.0, 10.0, options );
	const DLAMBDA = new Float64Array( DLAMBDAInit.length );
	const wInit = uniform( N * N, -10.0, 10.0, options );
	const w = new Float64Array( wInit.length );
	const Q2Init = uniform( N * N, -10.0, 10.0, options );
	const Q2 = new Float64Array( Q2Init.length );
	const INDX = new Int32Array( N * N );
	const INDXC = new Int32Array( N * N );
	const INDXP = new Int32Array( N * N );
	const COLTYP = new Int32Array( N * N );
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
			// Restore the arrays repeated in-place calls would grow to Inf/NaN:
			z.set( zInit );
			DLAMBDA.set( DLAMBDAInit );
			w.set( wInit );
			Q2.set( Q2Init );
			out = dlaed2( N, 1, d, 1, 0, Q, 1, N, 0, INDXQ, 1, 0, 1.0, z, 1, 0, DLAMBDA, 1, 0, w, 1, 0, Q2, 1, 0, INDX, 1, 0, INDXC, 1, 0, INDXP, 1, 0, COLTYP, 1, 0 );
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
