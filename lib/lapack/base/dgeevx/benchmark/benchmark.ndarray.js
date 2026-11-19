/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import dgeevx from './../lib/ndarray.js';


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
	const A = uniform( N * N, -10.0, 10.0, options );
	const WR = uniform( N * N, -10.0, 10.0, options );
	const WI = uniform( N * N, -10.0, 10.0, options );
	const VL = uniform( N * N, -10.0, 10.0, options );
	const VR = uniform( N * N, -10.0, 10.0, options );
	const SCALE = uniform( N * N, -10.0, 10.0, options );
	const RCONDE = uniform( N * N, -10.0, 10.0, options );
	const RCONDV = uniform( N * N, -10.0, 10.0, options );
	const work = uniform( (4 * N * N) + (64 * N), -10.0, 10.0, options );
	const iwork = new Int32Array( (4 * N * N) + (64 * N) );
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		let i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'none', N, A, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, work, 1, 0, iwork, 1, 0 );
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
