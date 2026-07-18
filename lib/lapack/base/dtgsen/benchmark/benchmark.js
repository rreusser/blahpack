

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dtgsen from './../lib/dtgsen.js';


// VARIABLES //

const options = {
	'dtype': 'float64'
};


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} len - array length
* @returns {Function} benchmark function
*/
function createBenchmark( len ) {
	const N = len;
	const SELECT = uniform( N * N, -10.0, 10.0, options );
	const A = uniform( N * N, -10.0, 10.0, options );
	const B = uniform( N * N, -10.0, 10.0, options );
	const ALPHAR = uniform( N * N, -10.0, 10.0, options );
	const ALPHAI = uniform( N * N, -10.0, 10.0, options );
	const BETA = uniform( N * N, -10.0, 10.0, options );
	const Q = uniform( N * N, -10.0, 10.0, options );
	const Z = uniform( N * N, -10.0, 10.0, options );
	const DIF = uniform( N * N, -10.0, 10.0, options );
	const WORK = uniform( N * N, -10.0, 10.0, options );
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		let y, i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			y = dtgsen( 'row-major', N, N, N, SELECT, N, N, A, N, B, N, ALPHAR, N, ALPHAI, N, BETA, N, Q, N, Z, N, N, N, N, DIF, N, WORK, N, N, N, N, N, N );
			if ( isnan( y ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( y ) ) {
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
	let len, f, i;

	const min = 1; // 10^min
	const max = 3; // 10^max

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:len=%d', pkg, len ), f );
	}
}

main();
