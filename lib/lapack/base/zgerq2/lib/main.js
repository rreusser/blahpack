// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgerq2 from './zgerq2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgerq2, 'ndarray', ndarray );


// EXPORTS //

export default zgerq2;
