// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dpoequ from './dpoequ.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dpoequ, 'ndarray', ndarray );


// EXPORTS //

export default dpoequ;
