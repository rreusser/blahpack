// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dpbequ from './dpbequ.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dpbequ, 'ndarray', ndarray );


// EXPORTS //

export default dpbequ;
