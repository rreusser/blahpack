/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsyconvf_rook from './dsyconvf_rook.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsyconvf_rook, 'ndarray', ndarray );


// EXPORTS //

export default dsyconvf_rook;
