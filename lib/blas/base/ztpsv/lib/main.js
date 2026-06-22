// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztpsv from './ztpsv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztpsv, 'ndarray', ndarray );


// EXPORTS //

export default ztpsv;
