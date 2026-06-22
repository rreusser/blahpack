
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtgexc from './dtgexc.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtgexc, 'ndarray', ndarray );


// EXPORTS //

export default dtgexc;
