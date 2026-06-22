// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlansy from './zlansy.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlansy, 'ndarray', ndarray );


// EXPORTS //

export default zlansy;
