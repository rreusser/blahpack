
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dopgtr from './dopgtr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dopgtr, 'ndarray', ndarray );


// EXPORTS //

export default dopgtr;
