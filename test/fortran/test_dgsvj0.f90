program test_dgsvj0
  use test_utils
  implicit none
  double precision :: a(128), v(128), d(16), sva(16), work(128)
  double precision :: eps, sfmin, tol
  integer :: info, i
  integer :: m, n, mv, lda, ldv
  ! Larger buffers for the reference-fixture cases below (ticket 0110)
  double precision :: aa(400), a0(400), vv(400), v0(400), dd(20), d0(20)
  double precision :: ss(20), s0(20), ww(20)
  double precision :: dnrm2
  external :: dnrm2
  integer :: j, nsw
  logical :: keepsva = .false.
  double precision, parameter :: dpat(6) = (/ 2.0d0, 0.5d0, 0.3d0, 4.0d0, 1.0d0, 0.7d0 /)

  eps = 2.220446049250313d-16
  sfmin = 2.2250738585072014d-308
  tol = 1.0d-10

  ! Test 1: JOBV='N', M=4, N=3, identity-ish
  m = 4
  n = 3
  lda = 4
  ldv = 1
  mv = 0
  a = 0.0d0
  a(1) = 1.0d0; a(2) = 2.0d0; a(3) = 3.0d0; a(4) = 4.0d0
  a(5) = 5.0d0; a(6) = 6.0d0; a(7) = 7.0d0; a(8) = 8.0d0
  a(9) = 9.0d0; a(10) = 10.0d0; a(11) = 11.0d0; a(12) = 12.0d0
  d(1) = 1.0d0; d(2) = 1.0d0; d(3) = 1.0d0
  ! Initial sva = column norms * d(p)
  sva(1) = sqrt(1.0d0*1+4.0d0+9.0d0+16.0d0)
  sva(2) = sqrt(25.0d0+36.0d0+49.0d0+64.0d0)
  sva(3) = sqrt(81.0d0+100.0d0+121.0d0+144.0d0)
  v = 0.0d0
  work = 0.0d0
  call dgsvj0('N', m, n, a, lda, d, sva, mv, v, ldv, eps, sfmin, tol, 5, work, m, info)
  call begin_test('novec_4x3')
  call print_array('a', a, 12)
  call print_array('d', d, 3)
  call print_array('sva', sva, 3)
  call print_int('info', info)
  call end_test()

  ! Test 2: JOBV='V', M=5, N=4
  m = 5
  n = 4
  lda = 5
  ldv = 4
  mv = 0
  a = 0.0d0
  do i = 1, 20
    a(i) = dble(mod(i*7, 11)) - 5.0d0
  end do
  d(1:4) = 1.0d0
  do i = 1, 4
    sva(i) = sqrt(a((i-1)*5+1)**2 + a((i-1)*5+2)**2 + a((i-1)*5+3)**2 + a((i-1)*5+4)**2 + a((i-1)*5+5)**2)
  end do
  v = 0.0d0
  v(1) = 1.0d0; v(6) = 1.0d0; v(11) = 1.0d0; v(16) = 1.0d0
  work = 0.0d0
  call dgsvj0('V', m, n, a, lda, d, sva, mv, v, ldv, eps, sfmin, tol, 5, work, m, info)
  call begin_test('vec_5x4')
  call print_array('a', a, 20)
  call print_array('v', v, 16)
  call print_array('d', d, 4)
  call print_array('sva', sva, 4)
  call print_int('info', info)
  call end_test()

  ! Test 3: JOBV='A', apply V with mv=3
  m = 4
  n = 3
  lda = 4
  ldv = 3
  mv = 3
  a = 0.0d0
  a(1) = 2.0d0; a(2) = 1.0d0; a(3) = 0.0d0; a(4) = 0.0d0
  a(5) = 1.0d0; a(6) = 2.0d0; a(7) = 1.0d0; a(8) = 0.0d0
  a(9) = 0.0d0; a(10) = 1.0d0; a(11) = 2.0d0; a(12) = 1.0d0
  d(1) = 1.0d0; d(2) = 1.0d0; d(3) = 1.0d0
  sva(1) = sqrt(5.0d0)
  sva(2) = sqrt(6.0d0)
  sva(3) = sqrt(6.0d0)
  v = 0.0d0
  v(1) = 1.0d0; v(5) = 1.0d0; v(9) = 1.0d0  ! identity 3x3
  work = 0.0d0
  call dgsvj0('A', m, n, a, lda, d, sva, mv, v, ldv, eps, sfmin, tol, 3, work, m, info)
  call begin_test('apply_4x3')
  call print_array('a', a, 12)
  call print_array('v', v, 9)
  call print_array('d', d, 3)
  call print_array('sva', sva, 3)
  call print_int('info', info)
  call end_test()

  ! Test 4: N=1 edge case, JOBV='N'
  m = 3
  n = 1
  lda = 3
  ldv = 1
  mv = 0
  a = 0.0d0
  a(1) = 3.0d0; a(2) = 4.0d0; a(3) = 0.0d0
  d(1) = 1.0d0
  sva(1) = 5.0d0
  v = 0.0d0
  work = 0.0d0
  call dgsvj0('N', m, n, a, lda, d, sva, mv, v, ldv, eps, sfmin, tol, 2, work, m, info)
  call begin_test('novec_n1')
  call print_array('a', a, 3)
  call print_array('d', d, 1)
  call print_array('sva', sva, 1)
  call print_int('info', info)
  call end_test()

  ! Test 5: Wider N > KBL (KBL=8, so N=9 triggers block structure)
  m = 10
  n = 9
  lda = 10
  ldv = 9
  mv = 0
  a = 0.0d0
  do i = 1, 90
    a(i) = dble(mod(i*37 + 13, 29)) - 14.0d0 + sin(dble(i)*0.11d0)
  end do
  d(1:9) = 1.0d0
  do i = 1, 9
    sva(i) = sqrt(sum(a((i-1)*10+1:(i-1)*10+10)**2))
  end do
  v = 0.0d0
  do i = 1, 9
    v((i-1)*9+i) = 1.0d0
  end do
  work = 0.0d0
  call dgsvj0('V', m, n, a, lda, d, sva, mv, v, ldv, eps, sfmin, tol, 4, work, m, info)
  call begin_test('vec_10x9_block')
  call print_array('a', a, 90)
  call print_array('v', v, 81)
  call print_array('d', d, 9)
  call print_array('sva', sva, 9)
  call print_int('info', info)
  call end_test()

  ! ---------------------------------------------------------------------
  ! Reference cases for the branches the property tests reach (ticket 0110):
  ! each prints the inputs (a0, d0, sva0, v0) and every output, so a JS test
  ! can rerun the exact input and compare A, V, D, SVA and INFO.
  ! ---------------------------------------------------------------------
  tol = 1.0d-13
  ! Full runs (NSWEEP = 30), and runs stopped after one and two sweeps: a
  ! converged Jacobi run reaches the same SVD whatever path it took, so only
  ! the stopped runs show what each branch computed.
  call cases('ref_', 30)
  call cases('ref1_', 1)
  call cases('ref2_', 2)
  keepsva = .false.
  ! NSWEEP = 0: no sweep, INFO = NSWEEP-1 = -1, columns sorted by SVA
  nsw = 0
  call gen(6, 5, 0); dd(1:5) = (/ 2.0d0, 0.5d0, 3.0d0, 0.25d0, 1.5d0 /)
  call runv('ref_nsweep0', 'V', 6, 5, 0)
  ! Convergence test at sweep 1 (i > SWBAND+1 needs i >= 2): one pair with
  ! TOL < |cos| < N*TOL and a tiny rotation
  nsw = 30
  tol = 1.0d-10
  call gen(3, 2, 0)
  do i = 0, 2
    aa(1+i) = sin(dble(i+1)); aa(4+i) = cos(dble(2*i+1))
  end do
  aa(1:3) = aa(1:3) / dnrm2(3, aa(1), 1)
  aa(4:6) = aa(4:6) - dot_product(aa(1:3), aa(4:6))*aa(1:3)
  aa(4:6) = aa(4:6) / dnrm2(3, aa(4), 1)
  aa(4:6) = 0.5d0*(1.5d-10*aa(1:3) + aa(4:6))
  dd = 1.0d0
  call runv('ref_conv_sweep1', 'V', 3, 2, 0)
  tol = 1.0d-13
  ! Off-diagonal Gram-Schmidt steps in both directions, followed by a pair
  ! that rotates. Reaching AAPP < AAQQ with a norm ratio beyond 1/SMALL in
  ! an off-diagonal block needs SVA on entry that overstates the first
  ! block's norms (the pivoting otherwise keeps the largest columns first);
  ! the routine recomputes SVA(p) for the first block from A.
  do nsw = 1, 30, 29
    call gen(12, 10, 2); dd = 1.0d0
    aa(97:108) = aa(97:108)*1.0d294
    do j = 1, 8
      ss(j) = 1.0d300
    end do
    ss(9) = dnrm2(12, aa(97), 1); ss(10) = dnrm2(12, aa(109), 1)
    keepsva = .true.
    if (nsw == 1) then
      call runv('ref1_gs_offdiag_mixed', 'V', 12, 10, 0)
    else
      call runv('ref_gs_offdiag_mixed', 'V', 12, 10, 0)
    end if
    keepsva = .false.
  end do
  ! An off-diagonal Gram-Schmidt step that is the first transformation of
  ! the sweep (MXSINJ = 0 before it), in each direction; the second needs
  ! SVA on entry that overstates the first block (see above).
  do nsw = 1, 30, 29
    aa = 0.0d0; dd = 1.0d0
    aa(1) = 1.0d150
    do j = 1, 7
      aa(j*9 + j + 1) = 1.0d0
    end do
    aa(73) = 1.0d-150; aa(81) = 1.0d-150
    if (nsw == 1) then
      call runv('ref1_gs_first_if', 'V', 9, 9, 0)
    else
      call runv('ref_gs_first_if', 'V', 9, 9, 0)
    end if
    aa = 0.0d0; dd = 1.0d0
    aa(1) = 1.0d-150
    do j = 1, 7
      aa(j*9 + j + 1) = 1.0d0
    end do
    aa(73) = 1.0d150; aa(81) = 1.0d150
    ss(1:8) = 1.0d300; ss(9) = dnrm2(9, aa(73), 1)
    keepsva = .true.
    if (nsw == 1) then
      call runv('ref1_gs_first_else', 'V', 9, 9, 0)
    else
      call runv('ref_gs_first_else', 'V', 9, 9, 0)
    end if
    keepsva = .false.
  end do
  nsw = 30

contains

  function pfxn(ns) result(r)
    integer, intent(in) :: ns
    character(len=5) :: r
    if (ns == 1) then
      r = 'ref1_'
    else
      r = 'ref_ '
    end if
  end function

  ! The reference cases, run with NSWEEP = nsdef and named with prefix pfx.
  subroutine cases(pfx, nsdef)
    character(len=*), intent(in) :: pfx
    integer, intent(in) :: nsdef
    integer :: k
    double precision, parameter :: scl3(3) = (/ 1.0d0, 1.0d160, 1.0d-160 /)
    double precision, parameter :: scl4(4) = (/ 1.0d0, 1.0d160, 1.0d-160, 1.0d-3 /)
    double precision, parameter :: vpat(12) = (/ 0.0d0, 0.0d0, 0.0d0, 0.0d0, 0.0d0, 0.0d0, &
                                                0.0d0, 3.0d0, 1.0d0, 2.0d0, -1.0d0, 2.0d0 /)
    character(len=5), parameter :: tag3(3) = (/ 'unit ', 'huge ', 'tiny ' /)
    character(len=5), parameter :: tag4(4) = (/ 'unit ', 'huge ', 'tiny ', 'small' /)
  nsw = nsdef

  ! non-unit D, one block
  call gen(6, 5, 0); dd(1:5) = (/ 2.0d0, 0.5d0, 3.0d0, 0.25d0, 1.5d0 /)
  call runv(trim(pfx)//'d_1blk', 'V', 6, 5, 0)
  ! non-unit D, two blocks
  call gen(12, 10, 3)
  do j = 1, 10
    dd(j) = dpat(mod(j-1, 6)+1)
  end do
  call runv(trim(pfx)//'d_2blk', 'V', 12, 10, 0)
  ! huge columns
  call gen(5, 4, 1); aa(1:20) = aa(1:20)*1.0d160; dd = 1.0d0
  call runv(trim(pfx)//'huge_1blk', 'V', 5, 4, 0)
  call gen(12, 10, 1); aa(1:120) = aa(1:120)*1.0d160; dd = 1.0d0
  call runv(trim(pfx)//'huge_2blk', 'V', 12, 10, 0)
  ! huge columns, non-unit D
  call gen(12, 10, 1); aa(1:120) = aa(1:120)*1.0d160
  do j = 1, 10
    dd(j) = dpat(mod(j-1, 6)+1)
  end do
  call runv(trim(pfx)//'huge_2blk_d', 'V', 12, 10, 0)
  ! tiny columns
  call gen(5, 4, 2); aa(1:20) = aa(1:20)*1.0d-160; dd = 1.0d0
  call runv(trim(pfx)//'tiny_1blk', 'V', 5, 4, 0)
  call gen(12, 10, 2); aa(1:120) = aa(1:120)*1.0d-160; dd = 1.0d0
  call runv(trim(pfx)//'tiny_2blk', 'V', 12, 10, 0)
  call gen(12, 10, 2); aa(1:120) = aa(1:120)*1.0d-160
  do j = 1, 10
    dd(j) = dpat(mod(j-1, 6)+1)
  end do
  call runv(trim(pfx)//'tiny_2blk_d', 'V', 12, 10, 0)
  ! nearly parallel columns (SVA recomputation after cancellation)
  call gen(6, 4, 6); dd = 1.0d0
  do i = 0, 5
    aa(7+i) = aa(1+i)*(1.0d0 + 1.0d-6*dble(mod(i, 3)))
    aa(19+i) = aa(13+i) + 1.0d-6*dble(mod(i*5, 7))
  end do
  call runv(trim(pfx)//'par_1blk', 'V', 6, 4, 0)
  call gen(12, 10, 6); dd = 1.0d0
  do i = 0, 11
    aa(109+i) = aa(1+i)*(1.0d0 + 1.0d-6*dble(mod(i, 3)))
    aa(97+i) = aa(13+i)*(1.0d0 - 1.0d-6*dble(mod(i, 4)))
  end do
  call runv(trim(pfx)//'par_2blk', 'V', 12, 10, 0)
  ! nearly parallel huge columns (dlassq recomputation)
  call gen(6, 4, 6); dd = 1.0d0
  do i = 0, 5
    aa(7+i) = aa(1+i)*(1.0d0 + 1.0d-8*dble(mod(i, 3)))
    aa(19+i) = aa(13+i) + 1.0d-8*dble(mod(i*5, 7))
  end do
  aa(1:24) = aa(1:24)*1.0d160
  call runv(trim(pfx)//'parhuge_1blk', 'V', 6, 4, 0)
  call gen(12, 10, 6); dd = 1.0d0
  do i = 0, 11
    aa(109+i) = aa(1+i)*(1.0d0 + 1.0d-6*dble(mod(i, 3)))
    aa(97+i) = aa(13+i)*(1.0d0 - 1.0d-6*dble(mod(i, 4)))
  end do
  aa(1:120) = aa(1:120)*1.0d160
  call runv(trim(pfx)//'parhuge_2blk', 'V', 12, 10, 0)
  ! nearly parallel tiny columns
  call gen(12, 10, 6); dd = 1.0d0
  do i = 0, 11
    aa(109+i) = aa(1+i)*(1.0d0 + 1.0d-6*dble(mod(i, 3)))
    aa(97+i) = aa(13+i)*(1.0d0 - 1.0d-6*dble(mod(i, 4)))
    aa(1+i) = aa(25+i)*(1.0d0 + 1.0d-7*dble(mod(i, 5)))
  end do
  aa(1:120) = aa(1:120)*1.0d-160
  call runv(trim(pfx)//'partiny_2blk', 'V', 12, 10, 0)
  ! zero columns
  call gen(6, 5, 7); dd = 1.0d0; aa(13:18) = 0.0d0
  call runv(trim(pfx)//'zero_1blk', 'V', 6, 5, 0)
  call gen(12, 10, 7); dd = 1.0d0; aa(37:48) = 0.0d0; aa(109:120) = 0.0d0
  call runv(trim(pfx)//'zero_2blk', 'V', 12, 10, 0)
  call gen(12, 10, 7); dd = 1.0d0
  aa(13:24) = 0.0d0; aa(49:60) = 0.0d0; aa(73:84) = 0.0d0
  call runv(trim(pfx)//'zero_first_blk', 'V', 12, 10, 0)
  ! Gram-Schmidt steps (norm ratio beyond 1/small)
  call gen(3, 2, 5); dd = 1.0d0
  aa(1:3) = aa(1:3)*1.0d150; aa(4:6) = aa(4:6)*1.0d-150
  call runv(trim(pfx)//'gs_n2', 'V', 3, 2, 0)
  call gen(4, 3, 5); dd = 1.0d0
  aa(1:4) = aa(1:4)*1.0d150; aa(5:8) = aa(5:8)*1.0d-150
  call runv(trim(pfx)//'gs_1blk', 'V', 4, 3, 0)
  call gen(12, 10, 4); dd = 1.0d0
  aa(1:12) = aa(1:12)*1.0d-150; aa(13:24) = aa(13:24)*1.0d150
  aa(97:108) = aa(97:108)*1.0d-150; aa(109:120) = aa(109:120)*1.0d150
  call runv(trim(pfx)//'gs_2blk', 'V', 12, 10, 0)
  call gen(12, 10, 4)
  aa(1:12) = aa(1:12)*1.0d-150; aa(13:24) = aa(13:24)*1.0d150
  aa(97:108) = aa(97:108)*1.0d-150; aa(109:120) = aa(109:120)*1.0d150
  do j = 1, 10
    dd(j) = dpat(mod(j-1, 6)+1)
  end do
  call runv(trim(pfx)//'gs_2blk_d', 'V', 12, 10, 0)
  ! small-norm columns across two blocks
  call gen(12, 10, 10); aa(1:120) = aa(1:120)*1.0d-3; dd = 1.0d0
  call runv(trim(pfx)//'small_2blk', 'V', 12, 10, 0)
  ! sweeps exhausted: INFO = NSWEEP-1
  if (nsdef == 30) then
  nsw = 2
  call gen(12, 10, 1); dd = 1.0d0
  call runv(trim(pfx)//'nsweep2', 'V', 12, 10, 0)
  nsw = 3
  call gen(12, 10, 1); dd = 1.0d0
  call runv(trim(pfx)//'nsweep3', 'V', 12, 10, 0)
  end if
  nsw = nsdef
  ! three column blocks
  call gen(20, 20, 0); dd = 1.0d0
  call runv(trim(pfx)//'n20', 'V', 20, 20, 0)
  ! JOBV='A' with MV != N, two blocks, non-unit D
  call gen(12, 10, 8)
  do j = 1, 10
    dd(j) = dpat(mod(j-1, 6)+1)
  end do
  call runv(trim(pfx)//'apply_2blk_d', 'A', 12, 10, 7)
  ! JOBV='N', two blocks, non-unit D
  call gen(12, 10, 8)
  do j = 1, 10
    dd(j) = dpat(mod(j-1, 6)+1)
  end do
  call runv(trim(pfx)//'novec_2blk_d', 'N', 12, 10, 0)
  ! strongly cancelling (1e-9) nearly parallel pairs: SVA recomputation in
  ! the diagonal block (dnrm2 and dlassq paths) and the off-diagonal block
  do k = 1, 3
    call gen(6, 4, 6); dd = 1.0d0
    do i = 0, 5
      aa(7+i) = aa(1+i)*(1.0d0 + 1.0d-9*dble(mod(i, 3)))
      aa(19+i) = aa(13+i) + 1.0d-9*dble(mod(i*5, 7))
    end do
    aa(1:24) = aa(1:24)*scl3(k)
    call runv(trim(pfx)//'par9_1blk_'//trim(tag3(k)), 'V', 6, 4, 0)
    call gen(12, 10, 6); dd = 1.0d0
    do i = 0, 11
      aa(109+i) = aa(1+i)*(1.0d0 + 1.0d-9*dble(mod(i, 3)))
      aa(97+i) = aa(13+i)*(1.0d0 - 1.0d-9*dble(mod(i, 4)))
    end do
    aa(1:120) = aa(1:120)*scl3(k)
    call runv(trim(pfx)//'par9_2blk_'//trim(tag3(k)), 'V', 12, 10, 0)
  end do
  ! off-diagonal rotation against a larger, nearly parallel column: SVA(p)
  ! recomputation (dnrm2 and dlassq paths; norms below one)
  do k = 1, 4
    aa = 0.0d0; dd = 1.0d0
    do j = 0, 6
      aa(j*12 + j + 1) = 100.0d0*scl4(k)
    end do
    do i = 0, 11
      aa(85+i) = vpat(i+1)*(1.0d0 + 1.0d-9*dble(mod(i, 3)))*scl4(k)
      aa(97+i) = vpat(i+1)*(1.0d0 - 1.0d-9*dble(mod(i, 5)))*scl4(k)
      aa(109+i) = vpat(i+1)*(1.0d0 + 1.0d-9*dble(mod(i, 2)))*scl4(k)
    end do
    call runv(trim(pfx)//'offdiag_larger_'//trim(tag4(k)), 'V', 12, 10, 0)
  end do
  ! off-diagonal rotation against a smaller, nearly parallel column (N = 9:
  ! the second block holds it alone): SVA(q) recomputation
  do k = 1, 3
    aa = 0.0d0; dd = 1.0d0
    do j = 0, 6
      aa(j*12 + j + 1) = 100.0d0*scl3(k)
    end do
    do i = 0, 11
      aa(85+i) = vpat(i+1)*(1.0d0 + 1.0d-9*dble(mod(i, 5)))*scl3(k)
      aa(97+i) = vpat(i+1)*(1.0d0 - 1.0d-9*dble(mod(i, 3)))*scl3(k)
    end do
    call runv(trim(pfx)//'offdiag_smaller_'//trim(tag3(k)), 'V', 12, 9, 0)
  end do
  ! equal D below one (the D(p) >= D(q) choice at equality), two blocks
  call gen(12, 10, 9); dd = 0.5d0
  call runv(trim(pfx)//'dhalf_2blk', 'V', 12, 10, 0)
  ! ... and with no rotation before the first off-diagonal pair, so that
  ! pair sees D(p) = D(q) = 0.5 exactly
  aa = 0.0d0; dd = 0.5d0
  do j = 0, 7
    aa(j*9 + j + 1) = dble(9 - j)
  end do
  aa(73:81) = 1.0d0
  call runv(trim(pfx)//'dhalf_offdiag', 'V', 9, 9, 0)
  end subroutine

  subroutine gen(mm, nn, seed)
    integer, intent(in) :: mm, nn, seed
    integer :: k
    aa = 0.0d0
    do k = 0, mm*nn - 1
      aa(k+1) = dble(mod(k*37 + 11 + seed, 23)) - 11.0d0 + 0.1d0*dble(mod(k, 7))
    end do
  end subroutine

  ! Runs DGSVJ0 on aa(1:mm*nn), dd(1:nn), with SVA = ||A(:,j)||*D(j) and
  ! V = I (JOBV='V'), V = an MV-by-N test matrix (JOBV='A'), or no V ('N').
  subroutine runv(name, jobv, mm, nn, mvv)
    character(len=*), intent(in) :: name
    character(len=1), intent(in) :: jobv
    integer, intent(in) :: mm, nn, mvv
    integer :: k, ldvv, nv
    if (.not. keepsva) then
      do k = 1, nn
        ss(k) = dnrm2(mm, aa((k-1)*mm+1), 1)*dd(k)
      end do
    end if
    vv = 0.0d0
    if (jobv == 'V') then
      ldvv = nn
      do k = 1, nn
        vv((k-1)*nn+k) = 1.0d0
      end do
    else if (jobv == 'A') then
      ldvv = mvv
      do k = 0, mvv*nn - 1
        vv(k+1) = dble(mod(k*13 + 5, 17)) - 8.0d0
      end do
    else
      ldvv = 1
    end if
    nv = ldvv*nn
    if (jobv == 'N') nv = 1
    a0(1:mm*nn) = aa(1:mm*nn); d0(1:nn) = dd(1:nn); s0(1:nn) = ss(1:nn)
    v0(1:nv) = vv(1:nv)
    ww = 0.0d0
    call dgsvj0(jobv, mm, nn, aa, mm, dd, ss, mvv, vv, ldvv, eps, sfmin, &
                tol, nsw, ww, mm, info)
    call begin_test(name)
    call print_char('jobv', jobv)
    call print_int('M', mm)
    call print_int('N', nn)
    call print_int('mv', mvv)
    call print_int('ldv', ldvv)
    call print_int('nsweep', nsw)
    call print_scalar('tol', tol)
    call print_array('a0', a0, mm*nn)
    call print_array('d0', d0, nn)
    call print_array('sva0', s0, nn)
    call print_array('v0', v0, nv)
    call print_array('a', aa, mm*nn)
    call print_array('d', dd, nn)
    call print_array('sva', ss, nn)
    call print_array('v', vv, nv)
    call print_int('info', info)
    call end_test()
  end subroutine

end program
