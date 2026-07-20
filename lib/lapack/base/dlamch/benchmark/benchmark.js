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

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dlamch from './../lib/dlamch.js';


// VARIABLES //

const CODES = [ 'epsilon', 'safe-minimum', 'base', 'precision', 'overflow' ];


// MAIN //

bench( pkg, function benchmark( b ) {
	let y, i;

	b.tic();
	for ( i = 0; i < b.iterations; i++ ) {
		y = dlamch( CODES[ i % CODES.length ] );
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
});
