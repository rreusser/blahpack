
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dpbstf from './dpbstf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dpbstf, 'ndarray', ndarray );


// EXPORTS //

export default dpbstf;
