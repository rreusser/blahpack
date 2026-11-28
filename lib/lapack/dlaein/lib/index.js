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
* Uses inverse iteration to find a right or left eigenvector of a real upper Hessenberg matrix.
*
* ## Notes
*
* -   `dlaein` applies one or more steps of inverse iteration on the shifted matrix `H - (wr + i*wi)*I` to refine an eigenvector for a specified eigenvalue. The workspace `B` must have leading dimension at least `N+1` (the complex case uses row `N+1` of `B` for the imaginary part).
* -   If `noinit` is `true`, the initial eigenvector estimate is generated internally; otherwise `VR` (and `VI` for a complex eigenvalue) is used as a starting point.
* -   The routine returns `0` on success, or `1` if inverse iteration failed to converge. The real case uses only `VR`; the complex case populates both `VR` and `VI`.
*
* @module @rreusser/blahpack/lapack/dlaein
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlaein from '@rreusser/blahpack/lapack/dlaein';
*
* var H = new Float64Array( [ 2.0, 0.0, 0.0, 1.0, 3.0, 0.0, 0.5, 1.0, 4.0 ] );
* var B = new Float64Array( 16 );
* var WORK = new Float64Array( 3 );
* var VR = new Float64Array( 3 );
* var VI = new Float64Array( 3 );
*
* var info = dlaein( 'column-major', true, true, 3, H, 3, 3.0, 0.0, VR, 1, VI, 1, B, 4, WORK, 1, 2.2e-13, 2.22e-305, 4.49e+304 );
* // returns 0
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaein from './dlaein.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaein, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dlaein & { ndarray: typeof ndarray }} */ ( dlaein );
export { ndarray };
