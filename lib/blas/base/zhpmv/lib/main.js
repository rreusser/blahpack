// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhpmv from './zhpmv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhpmv, 'ndarray', ndarray );


// EXPORTS //

export default zhpmv;
