// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztbmv from './ztbmv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztbmv, 'ndarray', ndarray );


// EXPORTS //

export default ztbmv;
