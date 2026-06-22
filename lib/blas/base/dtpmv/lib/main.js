
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtpmv from './dtpmv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtpmv, 'ndarray', ndarray );


// EXPORTS //

export default dtpmv;
