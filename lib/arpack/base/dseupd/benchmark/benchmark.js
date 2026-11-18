/**
* @license Apache-2.0
*/

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import dseupd from './../lib/dseupd.js';


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
	const d = uniform( 4 * N * N, -10.0, 10.0, options );
	const z = uniform( 4 * N * N, -10.0, 10.0, options );
	const resid = uniform( 4 * N * N, -10.0, 10.0, options );
	const v = uniform( 4 * N * N, -10.0, 10.0, options );
	const workd = uniform( 4 * N * N, -10.0, 10.0, options );
	const workl = uniform( 4 * N * N, -10.0, 10.0, options );
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
			out = dseupd( 'column-major', true, 'all', [ 0 ], 1, d, 1, z, N, 1.0, 'standard', N, 'LM', N, 1.0, resid, 1, N, v, N, [ 0 ], 1, [ 0 ], 1, workd, workl, N );
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
	const max = 3; // 10^max

	for ( i = min; i <= max; i++ ) {
		N = pow( 10, i );
		f = createBenchmark( N );
		bench( format( '%s:N=%d', pkg, N ), f );
	}
}

main();
