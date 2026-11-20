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
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import dlasd2 from './../lib/ndarray.js';


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
	const K = new Int32Array( N * N );
	const dInit = uniform( N * N, -10.0, 10.0, options );
	const d = new Float64Array( dInit.length );
	const zInit = uniform( N * N, -10.0, 10.0, options );
	const z = new Float64Array( zInit.length );
	const UInit = uniform( N * N, -10.0, 10.0, options );
	const U = new Float64Array( UInit.length );
	const VTInit = uniform( N * N, -10.0, 10.0, options );
	const VT = new Float64Array( VTInit.length );
	const DSIGMAInit = uniform( N * N, -10.0, 10.0, options );
	const DSIGMA = new Float64Array( DSIGMAInit.length );
	const U2Init = uniform( N * N, -10.0, 10.0, options );
	const U2 = new Float64Array( U2Init.length );
	const VT2Init = uniform( N * N, -10.0, 10.0, options );
	const VT2 = new Float64Array( VT2Init.length );
	const IDXP = new Int32Array( N * N );
	const IDX = new Int32Array( N * N );
	const IDXC = new Int32Array( N * N );
	const IDXQ = new Int32Array( N * N );
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
			d.set( dInit );
			z.set( zInit );
			U.set( UInit );
			VT.set( VTInit );
			DSIGMA.set( DSIGMAInit );
			U2.set( U2Init );
			VT2.set( VT2Init );
			out = dlasd2( N, N, 0, K, d, 1, 0, z, 1, 0, 1.0, 1.0, U, 1, N, 0, VT, 1, N, 0, DSIGMA, 1, 0, U2, 1, N, 0, VT2, 1, N, 0, IDXP, 1, 0, IDX, 1, 0, IDXC, 1, 0, IDXQ, 1, 0, COLTYP, 1, 0 );
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
