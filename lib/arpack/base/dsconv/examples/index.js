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
import dsconv from './../lib/base.js';

// Ritz values and their associated Ritz estimates (bounds):
var ritz = new Float64Array( [ 1.0, 2.0, 0.5, 3.0, 0.1 ] );
var bounds = new Float64Array( [ 1.0e-14, 0.5, 1.0e-16, 2.0e-3, 1.0e-12 ] );

// Count how many Ritz values have converged to a relative accuracy of 1e-6:
var nconv = dsconv( 5, ritz, 1, 0, bounds, 1, 0, 1.0e-6 );
console.log( nconv ); // eslint-disable-line no-console
// => 3
