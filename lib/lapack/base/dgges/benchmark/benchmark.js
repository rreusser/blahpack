

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dgges from './../lib/dgges.js';


// VARIABLES //

var options = {
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
	var N = len;
	var A = uniform( N * N, -10.0, 10.0, options );
	var B = uniform( N * N, -10.0, 10.0, options );
	var ALPHAR = uniform( N * N, -10.0, 10.0, options );
	var ALPHAI = uniform( N * N, -10.0, 10.0, options );
	var BETA = uniform( N * N, -10.0, 10.0, options );
	var VSL = uniform( N * N, -10.0, 10.0, options );
	var VSR = uniform( N * N, -10.0, 10.0, options );
	var WORK = uniform( N * N, -10.0, 10.0, options );
	var BWORK = uniform( N * N, -10.0, 10.0, options );
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var y;
		var i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			y = dgges( 'row-major', N, N, N, N, N, A, N, B, N, N, ALPHAR, N, ALPHAI, N, BETA, N, VSL, N, VSR, N, WORK, N, N, BWORK, N );
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
	var len;
	var min;
	var max;
	var f;
	var i;

	min = 1; // 10^min
	max = 3; // 10^max

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:len=%d', pkg, len ), f );
	}
}

main();
