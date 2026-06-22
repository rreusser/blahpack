
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztgexc from './ztgexc.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztgexc, 'ndarray', ndarray );


// EXPORTS //

export default ztgexc;
