/* eslint-disable camelcase */

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsytrf from './../../zsytrf/lib/base.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zla_syrcond_x from './../lib/ndarray.js';


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
	var IPIV;
	var WORK;
	var data;
	var view;
	var AF;
	var A;
	var X;
	var i;

	data = uniform( 2 * N * N, -1.0, 1.0, options );
	A = new Complex128Array( data.buffer.slice() );
	view = reinterpret( A, 0 );
	for ( i = 0; i < N; i++ ) {
		view[ 2 * ( ( i * N ) + i ) ] += ( 2.0 * N ) + 1.0;
	}
	AF = new Complex128Array( A );
	IPIV = new Int32Array( N );
	zsytrf( 'upper', N, AF, 1, N, 0, IPIV, 1, 0 );

	X = new Complex128Array( uniform( 2 * N, 0.5, 1.5, options ).buffer.slice() );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );

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
			y = zla_syrcond_x( 'upper', N, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
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
	var min;
	var max;
	var N;
	var f;
	var i;

	min = 1; // 10^min
	max = 2; // 10^max

	for ( i = min; i <= max; i++ ) {
		N = pow( 10, i );
		f = createBenchmark( N );
		bench( format( '%s:ndarray:N=%d', pkg, N ), f );
	}
}

main();
