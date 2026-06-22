// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dsyconRook from './../lib/dsycon_rook.js';


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var rcond;
	var iwork;
	var work;
	var ipiv;
	var A;
	var i;
	A = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		A[ (i*N) + i ] = N + 1.0;
	}
	ipiv = new Int32Array( N );
	for ( i = 0; i < N; i++ ) {
		ipiv[ i ] = i + 1;
	}
	work = new Float64Array( 2 * N );
	iwork = new Int32Array( N );
	rcond = new Float64Array( 1 );
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
			info = dsyconRook( 'column-major', 'upper', N, A, N, ipiv, 1, 0, 1.0, rcond, work, 1, iwork, 1, 0 ); // eslint-disable-line max-len
			if ( isnan( rcond[ 0 ] ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( info !== 0 ) {
			b.fail( 'unexpected info' );
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

	min = 1;
	max = 2;

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:len=%d', pkg, len ), f );
	}
}

main();
