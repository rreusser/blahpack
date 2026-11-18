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
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarzt from './../../dlarzt/lib/dlarzt.js';
import pkgJson from './../package.json' with { type: 'json' };
import dlarzb from './../lib/dlarzb.js';


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
	const K = N / 2;
	const L = N / 2;
	const V = uniform( N * N, -1.0, 1.0, options );
	const TAU = new Float64Array( N );
	const T = new Float64Array( N * N );
	let j, k;

	// K reflectors whose trailing parts occupy the last L of the N rows (K + L = N), V is K-by-L (LDV = N).
	// Orthogonal block reflector: tau_j = 2/(1+||V(j,:)||^2), and T from dlarzt:
	for ( j = 0; j < K; j++ ) {
		TAU[ j ] = 1.0;
		for ( k = 0; k < L; k++ ) {
			TAU[ j ] += V[ j + ( k * N ) ] * V[ j + ( k * N ) ];
		}
		TAU[ j ] = 2.0 / TAU[ j ];
	}
	dlarzt( 'column-major', 'backward', 'rowwise', L, K, V, N, TAU, 1, T, N );
	const C = uniform( N * N, -10.0, 10.0, options );
	const WORK = uniform( (4 * N * N) + (64 * N), -10.0, 10.0, options );
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
			out = dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', N, N, K, L, V, N, T, N, C, N, WORK, N );
			if ( isnan( out[ i % out.length ] ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( out[ 0 ] ) ) {
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
