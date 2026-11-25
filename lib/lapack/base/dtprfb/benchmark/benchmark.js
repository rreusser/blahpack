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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import dtprfb from './../lib/dtprfb.js';


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
	const V = uniform( N * N, -10.0, 10.0, options );
	const T = uniform( N * N, -10.0, 10.0, options );
	const AInit = uniform( N * N, -10.0, 10.0, options );
	const A = new Float64Array( AInit.length );
	const BInit = uniform( N * N, -10.0, 10.0, options );
	const B = new Float64Array( BInit.length );
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
			// Restore the arrays repeated in-place calls would grow to Inf/NaN:
			A.set( AInit );
			B.set( BInit );
			out = dtprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', N, N, N, N, V, N, T, N, A, N, B, N, WORK, N );
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
