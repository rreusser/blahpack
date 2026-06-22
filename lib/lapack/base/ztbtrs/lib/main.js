
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztbtrs from './ztbtrs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztbtrs, 'ndarray', ndarray );


// EXPORTS //

export default ztbtrs;
