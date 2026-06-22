// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zlar1v from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Creates a benchmark function for a given tridiagonal order.
*
* @private
* @param {PositiveInteger} len - tridiagonal order
* @returns {Function} benchmark function
*/
function createBenchmark( len ) {
	var mingma = new Float64Array( 1 );
	var nrminv = new Float64Array( 1 );
	var rqcorr = new Float64Array( 1 );
	var ISUPPZ = new Int32Array( 2 );
	var negcnt = new Int32Array( 1 );
	var resid = new Float64Array( 1 );
	var WORK = new Float64Array( 4 * len );
	var ztz = new Float64Array( 1 );
	var LLD = new Float64Array( len );
	var LD = new Float64Array( len );
	var D = new Float64Array( len );
	var L = new Float64Array( len );
	var Z = new Complex128Array( len );
	var r = new Int32Array( 1 );
	var k;

	D[ 0 ] = 4.0;
	for ( k = 0; k < len - 1; k += 1 ) {
		L[ k ] = 1.0 / D[ k ];
		D[ k + 1 ] = 4.0 - L[ k ];
		LD[ k ] = L[ k ] * D[ k ];
		LLD[ k ] = L[ k ] * L[ k ] * D[ k ];
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
		for ( i = 0; i < b.iterations; i += 1 ) {
			r[ 0 ] = 0;
			zlar1v( len, 1, len, 4.0 - Math.sqrt( 3.0 ), D, 1, 0, L, 1, 0, LD, 1, 0, LLD, 1, 0, 1e-300, 0.0, Z, 1, 0, true, negcnt, ztz, mingma, r, ISUPPZ, 1, 0, nrminv, resid, rqcorr, WORK, 1, 0 ); // eslint-disable-line max-len
			if ( ztz[ 0 ] !== ztz[ 0 ] ) {
				b.fail( 'should not return NaN' );
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
	var len;
	var min;
	var max;
	var f;
	var i;

	min = 1;
	max = 4;

	for ( i = min; i <= max; i += 1 ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:len=%d', pkg, len ), f );
	}
}

main();
