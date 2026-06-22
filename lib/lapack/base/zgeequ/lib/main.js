// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgeequ from './zgeequ.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgeequ, 'ndarray', ndarray );


// EXPORTS //

export default zgeequ;
