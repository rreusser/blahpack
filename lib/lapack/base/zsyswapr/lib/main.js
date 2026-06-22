
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsyswapr from './zsyswapr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsyswapr, 'ndarray', ndarray );


// EXPORTS //

export default zsyswapr;
