// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dporfs from './dporfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dporfs, 'ndarray', ndarray );


// EXPORTS //

export default dporfs;
