

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztprfs from './ztprfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztprfs, 'ndarray', ndarray );


// EXPORTS //

export default ztprfs;
