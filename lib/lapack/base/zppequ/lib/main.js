// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zppequ from './zppequ.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zppequ, 'ndarray', ndarray );


// EXPORTS //

export default zppequ;
