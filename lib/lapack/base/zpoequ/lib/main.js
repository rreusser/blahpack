// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zpoequ from './zpoequ.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zpoequ, 'ndarray', ndarray );


// EXPORTS //

export default zpoequ;
