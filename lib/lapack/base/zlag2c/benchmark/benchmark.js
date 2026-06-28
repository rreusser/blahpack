/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zlag2c from './../lib/zlag2c.js';


// VARIABLES //

var options = {
	'dtype': 'float64'
};


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - matrix dimension
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var Arr = uniform( 2 * N * N, -10.0, 10.0, options );
	var A = new Complex128Array( Arr.buffer );
	var SA = new Complex128Array( N * N );
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var info;
		var i;
		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			info = zlag2c( 'column-major', N, N, A, N, SA, N );
			if ( info !== 0 ) {
				b.fail( 'unexpected info' );
			}
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
	var sizes;
	var i;

	sizes = [ 4, 16, 64, 256 ];
	for ( i = 0; i < sizes.length; i++ ) {
		bench( format( '%s:N=%d', pkg, sizes[ i ] ), createBenchmark( sizes[ i ] ) );
	}
}

main();
