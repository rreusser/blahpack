// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dppequ from './dppequ.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dppequ, 'ndarray', ndarray );


// EXPORTS //

export default dppequ;
