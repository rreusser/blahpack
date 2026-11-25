/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/**
* LAPACK routine to compute `y := alpha*|A|*|x| + beta*|y|` with a complex banded matrix for error-bound estimation.
*
* @module @rreusser/blahpack/lapack/base/zla_gbamv
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import zla_gbamv from '@rreusser/blahpack/lapack/base/zla_gbamv';
*
* var AB = new Complex128Array( 12 );
* var x = new Complex128Array( 4 );
* var y = new Float64Array( 4 );
*
* zla_gbamv( 'column-major', 'no-transpose', 4, 4, 1, 1, 1.0, AB, 3, x, 1, 0.0, y, 1 );
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import zla_gbamv from '@rreusser/blahpack/lapack/base/zla_gbamv';
*
* var AB = new Complex128Array( 12 );
* var x = new Complex128Array( 4 );
* var y = new Float64Array( 4 );
*
* zla_gbamv.ndarray( 'no-transpose', 4, 4, 1, 1, 1.0, AB, 1, 3, 0, x, 1, 0, 0.0, y, 1, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zla_gbamv.ndarray" }
