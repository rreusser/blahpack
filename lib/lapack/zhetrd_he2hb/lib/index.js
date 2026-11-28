/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable camelcase */

/**
* Reduces a complex Hermitian matrix `A` to complex Hermitian band-diagonal form `AB` by a unitary similarity transformation.
*
* ## Notes
*
* -   On entry, the relevant triangle of `A` (upper or lower) contains the Hermitian input. On exit, that triangle contains the band entries within `kd` of the diagonal, plus the reflectors representing `Q` for the entries further from the diagonal.
* -   The Fortran reference uses an `ILAENV2STAGE` query to size the workspace. This implementation ignores the `WORK` argument and allocates scratch buffers internally (sized for the chosen block factor).
* -   The "quick return" path triggers when `N <= kd+1`, in which case `AB` receives a direct copy of the relevant triangle of `A` and no reflectors are computed.
*
* @module @rreusser/blahpack/lapack/zhetrd_he2hb
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zhetrd_he2hb from '@rreusser/blahpack/lapack/zhetrd_he2hb';
*
* var N = 4;
* var kd = 1;
* var A = new Complex128Array( N * N );
* var AB = new Complex128Array( (kd+1) * N );
* var TAU = new Complex128Array( N - kd );
*
* zhetrd_he2hb( 'column-major', 'lower', N, kd, A, N, AB, kd+1, TAU, 1, null, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhetrd_he2hb from './zhetrd_he2hb.js';
import strided from './strided.js';


// MAIN //

setReadOnly( zhetrd_he2hb, 'strided', strided );


// EXPORTS //

export default /** @type {typeof zhetrd_he2hb & { strided: typeof strided }} */ ( zhetrd_he2hb );
export { strided };
