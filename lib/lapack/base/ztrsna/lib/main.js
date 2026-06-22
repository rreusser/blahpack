
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztrsna from './ztrsna.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztrsna, 'ndarray', ndarray );


// EXPORTS //

export default ztrsna;
