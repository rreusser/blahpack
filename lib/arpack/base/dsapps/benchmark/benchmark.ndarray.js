/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from ARPACK (arpack-ng 3.9.1), Copyright (c) 1996-2008 Rice
* University. Developed by D.C. Sorensen, R.B. Lehoucq, C. Yang, and
* K. Maschhoff, under the BSD-3-Clause license. See LICENSE.txt in the
* repository root for the full license text and upstream attribution.
*/

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dsapps from './../lib/ndarray.js';


// VARIABLES //

const options = {
	'dtype': 'float64'
};


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} len - problem size `n`
* @returns {Function} benchmark function
*/
function createBenchmark( len ) {
	let kplusp, resid, shift, kev, np, h, q, v, j;

	kev = 2;
	np = 2;
	kplusp = kev + np;

	v = uniform( len*kplusp, -1.0, 1.0, options );
	const dg = uniform( kplusp, -5.0, 5.0, options );
	const sd = uniform( kplusp, 0.1, 2.0, options );
	h = new Float64Array( kplusp*2 );
	for ( j = 0; j < kplusp; j++ ) {
		h[ j+kplusp ] = dg[ j ];
	}
	for ( j = 1; j < kplusp; j++ ) {
		h[ j ] = sd[ j ];
	}
	resid = uniform( len, -1.0, 1.0, options );
	shift = uniform( np, -3.0, 3.0, options );
	q = new Float64Array( kplusp*kplusp );

	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		let i;

		const workd = new Float64Array( 2*len );
		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			dsapps( len, kev, np, shift, 1, 0, v, 1, len, 0, h, 1, kplusp, 0, resid, 1, 0, q, 1, kplusp, 0, workd, 1, 0 );
			if ( isnan( resid[ 0 ] ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( resid[ 0 ] ) ) {
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
	let len, f, i;

	const min = 1; // 10^min
	const max = 5; // 10^max

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:ndarray:len=%d', pkg, len ), f );
	}
}

main();
