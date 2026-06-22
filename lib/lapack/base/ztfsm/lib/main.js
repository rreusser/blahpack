
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztfsm from './ztfsm.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztfsm, 'ndarray', ndarray );


// EXPORTS //

export default ztfsm;
