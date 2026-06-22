
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgbequ from './zgbequ.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgbequ, 'ndarray', ndarray );


// EXPORTS //

export default zgbequ;
