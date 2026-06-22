// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztpmv from './ztpmv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztpmv, 'ndarray', ndarray );


// EXPORTS //

export default ztpmv;
