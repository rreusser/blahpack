

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zgeevx from './../lib/zgeevx.js';


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
	const A = uniform( N * N, -10.0, 10.0, options );
	const w = uniform( N * N, -10.0, 10.0, options );
	const VL = uniform( N * N, -10.0, 10.0, options );
	const VR = uniform( N * N, -10.0, 10.0, options );
	const SCALE = uniform( N * N, -10.0, 10.0, options );
	const RCONDE = uniform( N * N, -10.0, 10.0, options );
	const RCONDV = uniform( N * N, -10.0, 10.0, options );
	const WORK = uniform( N * N, -10.0, 10.0, options );
	const RWORK = uniform( N * N, -10.0, 10.0, options );
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
			y = zgeevx( 'row-major', N, N, N, N, N, A, N, w, N, VL, N, VR, N, N, N, SCALE, N, N, RCONDE, N, RCONDV, N, WORK, N, N, RWORK, N );
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
