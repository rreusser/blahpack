
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zpbstf from './zpbstf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zpbstf, 'ndarray', ndarray );


// EXPORTS //

export default zpbstf;
