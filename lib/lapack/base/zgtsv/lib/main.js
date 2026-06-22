// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgtsv from './zgtsv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgtsv, 'ndarray', ndarray );


// EXPORTS //

export default zgtsv;
