// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztfttr from './ztfttr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztfttr, 'ndarray', ndarray );


// EXPORTS //

export default ztfttr;
