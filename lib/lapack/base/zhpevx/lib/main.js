
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhpevx from './zhpevx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhpevx, 'ndarray', ndarray );


// EXPORTS //

export default zhpevx;
