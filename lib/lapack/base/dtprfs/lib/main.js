
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtprfs from './dtprfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtprfs, 'ndarray', ndarray );


// EXPORTS //

export default dtprfs;
