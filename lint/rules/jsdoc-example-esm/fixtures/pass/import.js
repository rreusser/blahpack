// target: lib/lapack/ddisna/lib/index.js
/**
* Computes reciprocal condition numbers.
*
* @module @rreusser/blahpack/lapack/ddisna
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import ddisna from '@rreusser/blahpack/lapack/ddisna';
*
* const d = new Float64Array( [ 1.0, 2.0 ] );
*/

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ddisna from './ddisna.js';
import strided from './strided.js';

setReadOnly( ddisna, 'strided', strided );

export default /** @type {typeof ddisna & { strided: typeof strided }} */ ( ddisna );
export { strided };
