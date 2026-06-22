// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dlarrb from './../lib/dlarrb.js';


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var IWORK = new Int32Array( 2 * N );
	var WERR = new Float64Array( N );
	var WGAP = new Float64Array( N );
	var WORK = new Float64Array( 2 * N );
	var LLD = new Float64Array( N );
	var d = new Float64Array( N );
	var w = new Float64Array( N );
	var i;

	// Build a diagonal factorization with eigenvalues `1..N`:
	for ( i = 0; i < N; i++ ) {
		d[ i ] = i + 1;
		LLD[ i ] = 0.0;
		w[ i ] = i + 1 + 0.1;
		WERR[ i ] = 0.5;
		WGAP[ i ] = 0.9;
	}
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var y;
		var j;

		b.tic();
		for ( j = 0; j < b.iterations; j++ ) {
			w[ 0 ] = 1.1;
			WERR[ 0 ] = 0.5;
			y = dlarrb( N, d, 1, LLD, 1, 1, N, 1.0e-8, 1.0e-14, 0, w, 1, WGAP, 1, WERR, 1, WORK, 1, IWORK, 1, 0, 2.2e-308, N, -1 ); // eslint-disable-line max-len
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
