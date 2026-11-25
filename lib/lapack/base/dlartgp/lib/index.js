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
* Generate a plane rotation with non-negative diagonal.
*
* @module @rreusser/blahpack/lapack/base/dlartgp
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlartgp from '@rreusser/blahpack/lapack/base/dlartgp';
*
* var cs = new Float64Array( 1 );
* var sn = new Float64Array( 1 );
* var r = new Float64Array( 1 );
*
* dlartgp( 1.0, 1.0, cs, sn, r );
* // r[ 0 ] => ~1.414213562
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlartgp from '@rreusser/blahpack/lapack/base/dlartgp';
*
* var cs = new Float64Array( 1 );
* var sn = new Float64Array( 1 );
* var r = new Float64Array( 1 );
*
* // A negative `f` flips the sign of `cs` so that `r` is non-negative:
* dlartgp.ndarray( -3.0, 4.0, cs, sn, r );
* // cs[ 0 ] => -0.6
* // sn[ 0 ] => 0.8
* // r[ 0 ] => 5.0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlartgp.ndarray" }
