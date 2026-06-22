
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtbmv from './dtbmv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtbmv, 'ndarray', ndarray );


// EXPORTS //

export default dtbmv;
