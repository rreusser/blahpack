/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zlacrm from './../lib/zlacrm.js';


// VARIABLES //

var options = {
	'dtype': 'float64'
};


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var RWORK;
	var A;
	var B;
	var C;
	A = new Complex128Array( uniform( 2 * N * N, -10.0, 10.0, options ) );
	B = new Float64Array( uniform( N * N, -10.0, 10.0, options ) );
	C = new Complex128Array( N * N );
	RWORK = new Float64Array( 2 * N * N );
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var i;
		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			zlacrm( 'column-major', N, N, A, N, B, N, C, N, RWORK );
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
	var len;
	var min;
	var max;
	var f;
	var i;

	min = 1; // 10^min
	max = 2; // 10^max

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:N=%d', pkg, len ), f );
	}
}

main();
