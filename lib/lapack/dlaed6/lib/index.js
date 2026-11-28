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

import setReadOnly from '@stdlib/utils/define-read-only-property/lib/index.js';
import dlaed6 from './dlaed6.js';
import strided from './strided.js';


// MAIN //

setReadOnly( dlaed6, 'strided', strided );


// EXPORTS //

export default /** @type {typeof dlaed6 & { strided: typeof strided }} */ ( dlaed6 );
export { strided };
