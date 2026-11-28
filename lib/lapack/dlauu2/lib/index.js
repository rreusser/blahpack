/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlauu2 from './dlauu2.js';
import strided from './strided.js';


// MAIN //

setReadOnly( dlauu2, 'strided', strided );


// EXPORTS //

export default /** @type {typeof dlauu2 & { strided: typeof strided }} */ ( dlauu2 );
export { strided };
