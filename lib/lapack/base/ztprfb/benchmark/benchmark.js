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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import ztprfb from './../lib/ztprfb.js';


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
	const V = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const T = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const AInit = uniform( 2 * ( N * N ), -10.0, 10.0, options );
	const A = new Complex128Array( AInit.length / 2 );
	const AView = reinterpret( A, 0 );
	const BInit = uniform( 2 * ( N * N ), -10.0, 10.0, options );
	const B = new Complex128Array( BInit.length / 2 );
	const BView = reinterpret( B, 0 );
	const WORK = new Complex128Array( uniform( 2 * ( (4 * N * N) + (64 * N) ), -10.0, 10.0, options ) );
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
			AView.set( AInit );
			BView.set( BInit );
			out = ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', N, N, N, N, V, N, T, N, A, N, B, N, WORK, N );
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
		bench( format( '%s:N=%d', pkg, N ), f );
	}
}

main();
