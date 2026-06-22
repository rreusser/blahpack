
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztbrfs from './ztbrfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztbrfs, 'ndarray', ndarray );


// EXPORTS //

export default ztbrfs;
