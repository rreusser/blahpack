// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtrrfs from './dtrrfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtrrfs, 'ndarray', ndarray );


// EXPORTS //

export default dtrrfs;
