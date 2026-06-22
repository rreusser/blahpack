// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zpbequ from './zpbequ.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zpbequ, 'ndarray', ndarray );


// EXPORTS //

export default zpbequ;
