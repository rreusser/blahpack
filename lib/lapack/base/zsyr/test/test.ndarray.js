import __imp0 from './fixtures/upper_alpha1.json' with { type: 'json' };
import __imp1 from './fixtures/lower_alpha2m1.json' with { type: 'json' };
import __imp2 from './fixtures/n1_upper.json' with { type: 'json' };
import __imp3 from './fixtures/upper_4x4.json' with { type: 'json' };
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsyr from '../lib/ndarray.js';
var fixtures = {
	'upper_alpha1': __imp0,
	'lower_alpha2m1': __imp1,
	'n1_upper': __imp2,
	'upper_4x4': __imp3
};
function assertClose( actual, expected, tol ) { for ( var ii = 0; ii < expected.length; ii++ ) { if ( Math.abs( actual[ii] - expected[ii] ) > tol * ( 1.0 + Math.abs( expected[ii] ) ) ) { assert.fail( 'at ' + ii + ': ' + actual[ii] + ' vs ' + expected[ii] ); } } }
test( 'zsyr: upper alpha=1', function t() { var fix = fixtures.upper_alpha1; var n = fix.n; var LDA = 4; var A = new Complex128Array( LDA * n ); var Av = reinterpret( A, 0 ); Av[0]=1;Av[1]=0;Av[2*LDA]=2;Av[2*LDA+1]=1;Av[4*LDA]=3;Av[4*LDA+1]=-1;Av[2+2*LDA]=4;Av[3+2*LDA]=0;Av[2+4*LDA]=5;Av[3+4*LDA]=2;Av[4+4*LDA]=6;Av[5+4*LDA]=0; var x = new Complex128Array([1,1,2,-1,0,3]); zsyr('upper',n,new Complex128(1,0),x,1,0,A,1,LDA,0); assertClose(Array.from(Av).slice(0,2*LDA*n),fix.A,1e-14); });
test( 'zsyr: lower alpha=(2,-1)', function t() { var fix = fixtures.lower_alpha2m1; var n = fix.n; var LDA = 4; var A = new Complex128Array( LDA * n ); var Av = reinterpret( A, 0 ); Av[0]=1;Av[1]=0;Av[2]=2;Av[3]=1;Av[2+2*LDA]=4;Av[3+2*LDA]=0;Av[4]=3;Av[5]=-1;Av[4+2*LDA]=5;Av[5+2*LDA]=2;Av[4+4*LDA]=6;Av[5+4*LDA]=0; var x = new Complex128Array([1,1,2,-1,0,3]); zsyr('lower',n,new Complex128(2,-1),x,1,0,A,1,LDA,0); assertClose(Array.from(Av).slice(0,2*LDA*n),fix.A,1e-14); });
test( 'zsyr: N=0', function t() { var A = new Complex128Array(4); zsyr('upper',0,new Complex128(1,0),new Complex128Array(1),1,0,A,1,1,0); assert.ok(true); });
test( 'zsyr: N=1', function t() { var fix = fixtures.n1_upper; var A = new Complex128Array(1); var Av = reinterpret(A,0); Av[0]=3;Av[1]=2; zsyr('upper',1,new Complex128(1,0),new Complex128Array([1,-1]),1,0,A,1,1,0); assertClose(Array.from(Av),fix.A,1e-14); });
test( 'zsyr: alpha=0', function t() { var A = new Complex128Array(9); var Av = reinterpret(A,0); Av[0]=99;Av[1]=88; zsyr('upper',3,new Complex128(0,0),new Complex128Array(3),1,0,A,1,3,0); assert.equal(Av[0],99); });
test( 'zsyr: upper 4x4', function t() { var fix = fixtures.upper_4x4; var n = fix.n; var LDA = 4; var A = new Complex128Array(LDA*n); var Av = reinterpret(A,0); for(var j=0;j<n;j++)for(var ii=0;ii<=j;ii++){var idx=2*ii+2*LDA*j;Av[idx]=(ii+1)+(j+1);Av[idx+1]=(ii+1)-(j+1);} zsyr('upper',n,new Complex128(0.5,0.25),new Complex128Array([1,0.5,2,-0.5,-1,1,0.5,0.5]),1,0,A,1,LDA,0); assertClose(Array.from(Av).slice(0,2*LDA*n),fix.A,1e-14); });
