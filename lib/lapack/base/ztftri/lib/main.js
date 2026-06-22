
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztftri from './ztftri.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztftri, 'ndarray', ndarray );


// EXPORTS //

export default ztftri;
