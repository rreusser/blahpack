

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dseigt from './../lib/ndarray.js';


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
	var dg = uniform( N, -5.0, 5.0, options );
	var sd = uniform( N-1, -2.0, 2.0, options );
	var h = new Float64Array( N*2 );
	var eig = new Float64Array( N );
	var bounds = new Float64Array( N );
	var workl = new Float64Array( 3*N );
	var ierr;
	var j;
	for ( j = 0; j < N; j++ ) {
		h[ j+N ] = dg[ j ];
	}
	for ( j = 0; j < N-1; j++ ) {
		h[ j+1 ] = sd[ j ];
	}
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
			ierr = dseigt( 0.5, N, h, 1, N, 0, eig, 1, 0, bounds, 1, 0, workl, 1, 0 );
			if ( isnan( ierr ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( ierr ) ) {
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
	max = 6; // 10^max

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:ndarray:len=%d', pkg, len ), f );
	}
}

main();
