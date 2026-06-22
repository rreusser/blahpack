
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtftri from './dtftri.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtftri, 'ndarray', ndarray );


// EXPORTS //

export default dtftri;
