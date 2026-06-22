
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztbcon from './ztbcon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztbcon, 'ndarray', ndarray );


// EXPORTS //

export default ztbcon;
