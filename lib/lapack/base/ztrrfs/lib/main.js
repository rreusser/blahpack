
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztrrfs from './ztrrfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztrrfs, 'ndarray', ndarray );


// EXPORTS //

export default ztrrfs;
