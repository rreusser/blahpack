
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztrevc from './ztrevc.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztrevc, 'ndarray', ndarray );


// EXPORTS //

export default ztrevc;
