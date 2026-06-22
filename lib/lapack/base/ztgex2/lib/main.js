
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztgex2 from './ztgex2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztgex2, 'ndarray', ndarray );


// EXPORTS //

export default ztgex2;
