
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztpcon from './ztpcon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztpcon, 'ndarray', ndarray );


// EXPORTS //

export default ztpcon;
