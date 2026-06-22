// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgerfs from './dgerfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgerfs, 'ndarray', ndarray );


// EXPORTS //

export default dgerfs;
