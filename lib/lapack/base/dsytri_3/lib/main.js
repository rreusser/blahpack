
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsytri3 from './dsytri_3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsytri3, 'ndarray', ndarray );


// EXPORTS //

export default dsytri3;
