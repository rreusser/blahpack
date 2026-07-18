// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zlar1v from './../lib/zlar1v.js';


// FUNCTIONS //

/**
* Creates a benchmark function for a given tridiagonal order.
*
* @private
* @param {PositiveInteger} len - tridiagonal order
* @returns {Function} benchmark function
*/
function createBenchmark( len ) {
	const mingma = new Float64Array( 1 );
	const nrminv = new Float64Array( 1 );
	const rqcorr = new Float64Array( 1 );
	const ISUPPZ = new Int32Array( 2 );
	const negcnt = new Int32Array( 1 );
	const resid = new Float64Array( 1 );
	const WORK = new Float64Array( 4 * len );
	const ztz = new Float64Array( 1 );
	const LLD = new Float64Array( len );
	const LD = new Float64Array( len );
	const D = new Float64Array( len );
	const L = new Float64Array( len );
	const Z = new Complex128Array( len );
	const r = new Int32Array( 1 );
	let k;

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
		let i;

		b.tic();
		for ( i = 0; i < b.iterations; i += 1 ) {
			r[ 0 ] = 0;
			zlar1v( len, 1, len, 4.0 - Math.sqrt( 3.0 ), D, 1, L, 1, LD, 1, LLD, 1, 1e-300, 0.0, Z, 1, true, negcnt, ztz, mingma, r, ISUPPZ, 1, nrminv, resid, rqcorr, WORK, 1 ); // eslint-disable-line max-len
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
	let len, f, i;

	const min = 1;
	const max = 4;

	for ( i = min; i <= max; i += 1 ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:len=%d', pkg, len ), f );
	}
}

main();
