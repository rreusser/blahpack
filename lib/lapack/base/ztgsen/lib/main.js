
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztgsen from './ztgsen.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztgsen, 'ndarray', ndarray );


// EXPORTS //

export default ztgsen;
