// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtpsv from './dtpsv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtpsv, 'ndarray', ndarray );


// EXPORTS //

export default dtpsv;
