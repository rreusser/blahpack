
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtbrfs from './dtbrfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtbrfs, 'ndarray', ndarray );


// EXPORTS //

export default dtbrfs;
