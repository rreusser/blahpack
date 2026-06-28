/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable camelcase, no-mixed-operators, require-jsdoc, stdlib/jsdoc-private-annotation */

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dgbtrf from '../../dgbtrf/lib/base.js';
import dla_gbrcond from './../lib/dla_gbrcond.js';


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
	var LDAFB;
	var IWORK;
	var LDAB;
	var WORK;
	var IPIV;
	var AFB;
	var KL;
	var KU;
	var AB;
	var c;

	KL = 2;
	KU = 2;
	if ( KL >= N ) {
		KL = N - 1;
	}
	if ( KU >= N ) {
		KU = N - 1;
	}
	LDAB = KL + KU + 1;
	LDAFB = 2 * KL + KU + 1;

	AB = uniform( LDAB * N, -10.0, 10.0, options );
	AFB = new Float64Array( LDAFB * N );
	IPIV = new Int32Array( N );
	c = uniform( N, 0.1, 10.0, options );
	WORK = new Float64Array( 5 * N );
	IWORK = new Int32Array( N );

	// Copy AB into AFB at the appropriate offset and factor
	copyBandToFact( N, KL, KU, AB, LDAB, AFB, LDAFB );
	dgbtrf( N, N, KL, KU, AFB, 1, LDAFB, 0, IPIV, 1, 0 );

	return benchmark;

	function benchmark( b ) {
		var y;
		var i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			y = dla_gbrcond( 'row-major', 'no-transpose', N, KL, KU, AB, LDAB, AFB, LDAFB, IPIV, 1, c, WORK, IWORK );
			if ( y !== y ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( y !== y ) {
			b.fail( 'should not return NaN' );
		}
		b.pass( 'benchmark finished' );
		b.end();
	}
}

/**
* Copies band matrix AB into the factored storage AFB.
*
* @private
* @param {integer} N - matrix order
* @param {integer} KL - subdiagonals
* @param {integer} KU - superdiagonals
* @param {Float64Array} AB - source band matrix
* @param {integer} LDAB - leading dim of AB
* @param {Float64Array} AFB - destination factored storage
* @param {integer} LDAFB - leading dim of AFB
*/
function copyBandToFact( N, KL, KU, AB, LDAB, AFB, LDAFB ) {
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < LDAB; i++ ) {
			AFB[ (j * LDAFB) + KL + i ] = AB[ (j * LDAB) + i ];
		}
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
