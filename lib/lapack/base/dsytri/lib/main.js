
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsytri from './dsytri.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsytri, 'ndarray', ndarray );


// EXPORTS //

export default dsytri;
