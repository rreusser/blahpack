// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztgsyl from './ztgsyl.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztgsyl, 'ndarray', ndarray );


// EXPORTS //

export default ztgsyl;
