
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztgsja from './ztgsja.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztgsja, 'ndarray', ndarray );


// EXPORTS //

export default ztgsja;
