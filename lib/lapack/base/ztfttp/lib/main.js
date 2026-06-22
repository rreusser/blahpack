// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztfttp from './ztfttp.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztfttp, 'ndarray', ndarray );


// EXPORTS //

export default ztfttp;
