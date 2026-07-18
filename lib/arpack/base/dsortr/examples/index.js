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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsortr from './../lib/base.js';

// Ritz values and a companion vector (e.g. their error bounds):
const x1 = new Float64Array( [ 3.0, -1.0, 4.0, -1.5, 2.0 ] );
const x2 = new Float64Array( [ 10.0, 20.0, 30.0, 40.0, 50.0 ] );

// Sort so the largest algebraic value ends up last, permuting x2 alongside:
dsortr( 'LA', true, 5, x1, 1, 0, x2, 1, 0 );

console.log( x1 ); // eslint-disable-line no-console
// => <Float64Array>[ -1.5, -1.0, 2.0, 3.0, 4.0 ]

console.log( x2 ); // eslint-disable-line no-console
// => <Float64Array>[ 40.0, 20.0, 50.0, 10.0, 30.0 ]
