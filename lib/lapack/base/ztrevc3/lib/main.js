// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztrevc3 from './ztrevc3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztrevc3, 'ndarray', ndarray );


// EXPORTS //

export default ztrevc3;
