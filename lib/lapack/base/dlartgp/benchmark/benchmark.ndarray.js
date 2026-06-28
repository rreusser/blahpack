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
*/

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dlartgp from './../lib/ndarray.js';


// MAIN //

/**
* Benchmark ndarray export.
*
* @private
* @param {Benchmark} b - benchmark instance
*/
function benchmark( b ) {
	var out;
	var i;

	out = new Float64Array( 3 );
	b.tic();
	for ( i = 0; i < b.iterations; i++ ) {
		dlartgp( ( i % 7 ) + 1.0, ( i % 5 ) + 1.0, out );
		if ( isnan( out[ 2 ] ) ) {
			b.fail( 'should not return NaN' );
		}
	}
	b.toc();
	if ( isnan( out[ 2 ] ) ) {
		b.fail( 'should not return NaN' );
	}
	b.pass( 'benchmark finished' );
	b.end();
}

bench( pkg + ':ndarray', benchmark );
