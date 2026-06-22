// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgbsv from './zgbsv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgbsv, 'ndarray', ndarray );


// EXPORTS //

export default zgbsv;
