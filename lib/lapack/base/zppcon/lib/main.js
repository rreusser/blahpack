
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zppcon from './zppcon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zppcon, 'ndarray', ndarray );


// EXPORTS //

export default zppcon;
