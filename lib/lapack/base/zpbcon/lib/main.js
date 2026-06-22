// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zpbcon from './zpbcon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zpbcon, 'ndarray', ndarray );


// EXPORTS //

export default zpbcon;
