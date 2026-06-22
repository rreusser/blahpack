
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtgex2 from './dtgex2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtgex2, 'ndarray', ndarray );


// EXPORTS //

export default dtgex2;
