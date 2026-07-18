import __imp0 from './fixtures/upper_4x4.json' with { type: 'json' };
import __imp1 from './fixtures/lower_4x4.json' with { type: 'json' };
import __imp2 from './fixtures/n1.json' with { type: 'json' };
import __imp3 from './fixtures/lower_6x6.json' with { type: 'json' };
import __imp4 from './fixtures/singular_upper.json' with { type: 'json' };
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsytf2 from '../lib/ndarray.js';
const fixtures = {
	'upper_4x4': __imp0,
	'lower_4x4': __imp1,
	'n1': __imp2,
	'lower_6x6': __imp3,
	'singular_upper': __imp4
};
function assertClose( actual, expected, tol ) { for ( let ii = 0; ii < expected.length; ii++ ) { if ( Math.abs( actual[ii] - expected[ii] ) > tol * ( 1.0 + Math.abs( expected[ii] ) ) ) { assert.fail( 'at ' + ii + ': ' + actual[ii] + ' vs ' + expected[ii] ); } } }
function convertIPIV( f ) { const r = new Int32Array(f.length); for ( let ii = 0; ii < f.length; ii++ ) { r[ii] = f[ii] > 0 ? f[ii] - 1 : ~(-f[ii]-1); } return r; }
function buildMatrix( n, LDA, vals ) { const A = new Complex128Array(LDA*n); const Av = reinterpret(A,0); for(let k=0;k<vals.length;k++){const v=vals[k];const idx=2*v.i+2*LDA*v.j;Av[idx]=v.re;Av[idx+1]=v.im;} return A; }
function extractA( A, n, LDA ) { const Av = reinterpret(A,0); const r=[]; for(let j=0;j<n;j++)for(let idx=0;idx<2*LDA;idx++)r.push(Av[j*2*LDA+idx]); return r; }
test( 'zsytf2: upper 4x4', function t() { const fix = fixtures.upper_4x4; const n = fix.n; const LDA = 6; const A = buildMatrix(n,LDA,[{i:0,j:0,re:2,im:1},{i:0,j:1,re:1,im:2},{i:0,j:2,re:3,im:-1},{i:0,j:3,re:0.5,im:0.5},{i:1,j:1,re:5,im:-1},{i:1,j:2,re:2,im:1},{i:1,j:3,re:1,im:-2},{i:2,j:2,re:4,im:2},{i:2,j:3,re:3,im:0},{i:3,j:3,re:6,im:-3}]); const IPIV = new Int32Array(n); const info = zsytf2('upper',n,A,1,LDA,0,IPIV,1,0); assert.equal(info,fix.info); assertClose(extractA(A,n,LDA),fix.A,1e-13); const e = convertIPIV(fix.ipiv); for(let k=0;k<n;k++) assert.equal(IPIV[k],e[k]); });
test( 'zsytf2: lower 4x4', function t() { const fix = fixtures.lower_4x4; const n = fix.n; const LDA = 6; const A = buildMatrix(n,LDA,[{i:0,j:0,re:2,im:1},{i:1,j:0,re:1,im:2},{i:1,j:1,re:5,im:-1},{i:2,j:0,re:3,im:-1},{i:2,j:1,re:2,im:1},{i:2,j:2,re:4,im:2},{i:3,j:0,re:0.5,im:0.5},{i:3,j:1,re:1,im:-2},{i:3,j:2,re:3,im:0},{i:3,j:3,re:6,im:-3}]); const IPIV = new Int32Array(n); const info = zsytf2('lower',n,A,1,LDA,0,IPIV,1,0); assert.equal(info,fix.info); assertClose(extractA(A,n,LDA),fix.A,1e-13); const e = convertIPIV(fix.ipiv); for(let k=0;k<n;k++) assert.equal(IPIV[k],e[k]); });
test( 'zsytf2: N=0', function t() { assert.equal(zsytf2('upper',0,new Complex128Array(1),1,1,0,new Int32Array(1),1,0),0); });
test( 'zsytf2: N=1', function t() { const fix = fixtures.n1; const A = new Complex128Array(1); const Av = reinterpret(A,0); Av[0]=3;Av[1]=2; const IPIV = new Int32Array(1); assert.equal(zsytf2('upper',1,A,1,1,0,IPIV,1,0),fix.info); assertClose(Array.from(Av),fix.A,1e-14); });
test( 'zsytf2: lower 6x6', function t() { const fix = fixtures.lower_6x6; const n = fix.n; const LDA = 6; const A = buildMatrix(n,LDA,[{i:0,j:0,re:0.01,im:0},{i:1,j:0,re:5,im:1},{i:1,j:1,re:0.02,im:0},{i:2,j:0,re:1,im:-1},{i:2,j:1,re:2,im:1},{i:2,j:2,re:8,im:-2},{i:3,j:0,re:0.5,im:0.5},{i:3,j:1,re:1,im:-1},{i:3,j:2,re:3,im:0},{i:3,j:3,re:7,im:1},{i:4,j:0,re:2,im:0},{i:4,j:1,re:1.5,im:0.5},{i:4,j:2,re:0,im:2},{i:4,j:3,re:1,im:-0.5},{i:4,j:4,re:6,im:0},{i:5,j:0,re:1,im:1},{i:5,j:1,re:0,im:3},{i:5,j:2,re:1,im:0},{i:5,j:3,re:2,im:2},{i:5,j:4,re:0.5,im:-1},{i:5,j:5,re:5,im:-1}]); const IPIV = new Int32Array(n); const info = zsytf2('lower',n,A,1,LDA,0,IPIV,1,0); assert.equal(info,fix.info); assertClose(extractA(A,n,LDA),fix.A,1e-13); const e = convertIPIV(fix.ipiv); for(let k=0;k<n;k++) assert.equal(IPIV[k],e[k]); });
test( 'zsytf2: upper 6x6 2x2', function t() { const n = 6; const LDA = n; const A = buildMatrix(n,LDA,[{i:0,j:0,re:5,im:-1},{i:0,j:1,re:0.5,im:-1},{i:1,j:1,re:6,im:0},{i:0,j:2,re:1,im:-0.5},{i:1,j:2,re:0,im:2},{i:2,j:2,re:7,im:1},{i:0,j:3,re:2,im:2},{i:1,j:3,re:1,im:0},{i:2,j:3,re:3,im:0},{i:3,j:3,re:8,im:-2},{i:0,j:4,re:0,im:3},{i:1,j:4,re:1.5,im:0.5},{i:2,j:4,re:2,im:1},{i:3,j:4,re:1,im:-1},{i:4,j:4,re:0.02,im:0},{i:0,j:5,re:1,im:1},{i:1,j:5,re:2,im:0},{i:2,j:5,re:1,im:-1},{i:3,j:5,re:0.5,im:0.5},{i:4,j:5,re:5,im:1},{i:5,j:5,re:0.01,im:0}]); const IPIV = new Int32Array(n); assert.equal(zsytf2('upper',n,A,1,LDA,0,IPIV,1,0),0); let h=false;for(let k=0;k<n;k++)if(IPIV[k]<0){h=true;break;} assert.ok(h); });
test( 'zsytf2: singular', function t() { const fix = fixtures.singular_upper; const A = buildMatrix(3,6,[{i:0,j:0,re:0,im:0},{i:0,j:1,re:1,im:1},{i:0,j:2,re:2,im:0},{i:1,j:1,re:3,im:-1},{i:1,j:2,re:1,im:1},{i:2,j:2,re:2,im:2}]); assert.equal(zsytf2('upper',3,A,1,6,0,new Int32Array(3),1,0),fix.info); });
