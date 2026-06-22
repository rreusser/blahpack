
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtprfb from './dtprfb.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtprfb, 'ndarray', ndarray );


// EXPORTS //

export default dtprfb;
