
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhprfs from './zhprfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhprfs, 'ndarray', ndarray );


// EXPORTS //

export default zhprfs;
