// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zggevx from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var RCONDE = new Float64Array( N );
	var RCONDV = new Float64Array( N );
	var LSCALE = new Float64Array( N );
	var RSCALE = new Float64Array( N );
	var ALPHA = new Complex128Array( N );
	var Adata = uniform( 2 * N * N, -1.0, 1.0, {
		'dtype': 'float64'
	});
	var Bdata = uniform( 2 * N * N, -1.0, 1.0, {
		'dtype': 'float64'
	});
	var BETA = new Complex128Array( N );
	var VL = new Complex128Array( N * N );
	var VR = new Complex128Array( N * N );
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var A;
		var B;
		var r;
		var i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			A = new Complex128Array( new Float64Array( Adata ) );
			B = new Complex128Array( new Float64Array( Bdata ) );
			r = zggevx( 'none', 'compute-vectors', 'compute-vectors', 'none', N, A, 1, N, 0, B, 1, N, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, N, 0, VR, 1, N, 0, LSCALE, 1, 0, RSCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0 );
			if ( r.info !== 0 ) {
				b.fail( 'unexpected info: ' + r.info );
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
	var f;
	var N;
	var i;

	for ( i = 1; i <= 5; i++ ) {
		N = pow( 2, i );
		f = createBenchmark( N );
		bench( format( '%s:n=%d', pkg, N ), f );
	}
}

main();
