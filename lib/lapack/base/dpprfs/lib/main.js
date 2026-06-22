
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dpprfs from './dpprfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dpprfs, 'ndarray', ndarray );


// EXPORTS //

export default dpprfs;
