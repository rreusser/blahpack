// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztpttr from './ztpttr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztpttr, 'ndarray', ndarray );


// EXPORTS //

export default ztpttr;
