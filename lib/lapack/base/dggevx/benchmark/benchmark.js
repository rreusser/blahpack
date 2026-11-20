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
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import dggevx from './../lib/dggevx.js';


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
	const B = uniform( N * N, -10.0, 10.0, options );
	const ALPHAR = uniform( N * N, -10.0, 10.0, options );
	const ALPHAI = uniform( N * N, -10.0, 10.0, options );
	const BETA = uniform( N * N, -10.0, 10.0, options );
	const VL = uniform( N * N, -10.0, 10.0, options );
	const VR = uniform( N * N, -10.0, 10.0, options );
	const ilo = new Int32Array( [ 1 ] );
	const ihi = new Int32Array( [ 1 ] );
	const LSCALE = uniform( N * N, -10.0, 10.0, options );
	const RSCALE = uniform( N * N, -10.0, 10.0, options );
	const abnrm = new Float64Array( [ 1 ] );
	const bbnrm = new Float64Array( [ 1 ] );
	const RCONDE = uniform( N * N, -10.0, 10.0, options );
	const RCONDV = uniform( N * N, -10.0, 10.0, options );
	const work = uniform( (4 * N * N) + (64 * N), -10.0, 10.0, options );
	const iwork = new Int32Array( (4 * N * N) + (64 * N) );
	const bwork = new Uint8Array( (4 * N * N) + (64 * N) );
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
			out = dggevx( 'column-major', 'both', 'compute-vectors', 'compute-vectors', 'none', N, A, N, B, N, ALPHAR, 1, ALPHAI, 1, BETA, 1, VL, N, VR, N, ilo, ihi, LSCALE, 1, RSCALE, 1, abnrm, bbnrm, RCONDE, 1, RCONDV, 1, work, iwork, bwork );
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
