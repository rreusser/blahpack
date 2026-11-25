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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import dlarrd from './../lib/ndarray.js';


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
	const GERS = uniform( N * N, -10.0, 10.0, options );
	const d = uniform( N * N, -10.0, 10.0, options );
	const e = uniform( N * N, -10.0, 10.0, options );
	const E2 = uniform( N * N, -10.0, 10.0, options );
	const ISPLIT = new Int32Array( N * N );
	const m = new Int32Array( [ 1 ] );
	const w = uniform( N * N, -10.0, 10.0, options );
	const WERR = uniform( N * N, -10.0, 10.0, options );
	const wl = new Float64Array( [ 1 ] );
	const wu = new Float64Array( [ 1 ] );
	const IBLOCK = new Int32Array( N * N );
	const INDEXW = new Int32Array( N * N );
	const WORK = uniform( (4 * N * N) + (64 * N), -10.0, 10.0, options );
	const IWORK = new Int32Array( (4 * N * N) + (64 * N) );
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
			out = dlarrd( 'all', 'block', N, 1.0, 1.0, 1, 1, GERS, 1, 0, 1.0, d, 1, 0, e, 1, 0, E2, 1, 0, 1.0, N, ISPLIT, 1, 0, m, w, 1, 0, WERR, 1, 0, wl, wu, IBLOCK, 1, 0, INDEXW, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
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
