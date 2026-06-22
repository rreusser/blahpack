// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dpbcon from './dpbcon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dpbcon, 'ndarray', ndarray );


// EXPORTS //

export default dpbcon;
