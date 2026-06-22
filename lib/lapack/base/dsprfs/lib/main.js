
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsprfs from './dsprfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsprfs, 'ndarray', ndarray );


// EXPORTS //

export default dsprfs;
