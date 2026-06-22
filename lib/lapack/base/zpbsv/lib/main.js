// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zpbsv from './zpbsv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zpbsv, 'ndarray', ndarray );


// EXPORTS //

export default zpbsv;
