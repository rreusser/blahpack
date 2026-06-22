// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztrsyl from './ztrsyl.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztrsyl, 'ndarray', ndarray );


// EXPORTS //

export default ztrsyl;
