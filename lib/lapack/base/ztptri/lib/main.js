
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztptri from './ztptri.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztptri, 'ndarray', ndarray );


// EXPORTS //

export default ztptri;
