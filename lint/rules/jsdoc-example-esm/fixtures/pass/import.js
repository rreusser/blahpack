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
import ndarray from './ndarray.js';

setReadOnly( ddisna, 'ndarray', ndarray );

export default /** @type {typeof ddisna & { ndarray: typeof ndarray }} */ ( ddisna );
export { ndarray };
