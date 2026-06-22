// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztpttf from './ztpttf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztpttf, 'ndarray', ndarray );


// EXPORTS //

export default ztpttf;
