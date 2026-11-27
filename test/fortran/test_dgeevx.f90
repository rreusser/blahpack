program test_dgeevx
  use test_utils
  implicit none

  integer, parameter :: NMAX = 8
  double precision :: A(NMAX,NMAX), ACOPY(NMAX,NMAX)
  double precision :: WR(NMAX), WI(NMAX)
  double precision :: VL(NMAX,NMAX), VR(NMAX,NMAX)
  double precision :: SCALE(NMAX), RCONDE(NMAX), RCONDV(NMAX)
  double precision :: WORK(8*NMAX*NMAX + 32*NMAX)
  double precision :: ABNRM
  integer :: IWORK(4*NMAX)
  integer :: N, INFO, LWORK, ILO, IHI

  LWORK = 8*NMAX*NMAX + 32*NMAX

  ! ================================================
  ! Test 1: 4x4 diagonal matrix with BALANC='B'
  ! ================================================
  N = 4
  A = 0.0D0
  A(1,1) = 1.0D0
  A(2,2) = 2.0D0
  A(3,3) = 3.0D0
  A(4,4) = 4.0D0
  ACOPY(1:N,1:N) = A(1:N,1:N)

  call DGEEVX('B', 'V', 'V', 'N', N, A, NMAX, WR, WI, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, IWORK, INFO)
  call begin_test('diagonal_4x4_both_balance')
  call print_int('info', INFO)
  call print_int('n', N)
  call print_int('ilo', ILO)
  call print_int('ihi', IHI)
  call print_scalar('abnrm', ABNRM)
  call print_array('wr', WR, N)
  call print_array('wi', WI, N)
  call print_array('scale', SCALE, N)
  call print_matrix('vl', VL, N, N, NMAX)
  call print_matrix('vr', VR, N, N, NMAX)
  call print_matrix('a_input', ACOPY, N, N, NMAX)
  call end_test()

  ! ================================================
  ! Test 2: 4x4 with complex conjugate eigenvalue pairs, BALANC='N'
  ! ================================================
  N = 4
  A = 0.0D0
  A(1,1) = 0.0D0;  A(1,2) = 1.0D0;  A(1,3) = 0.0D0;  A(1,4) = 0.0D0
  A(2,1) = -1.0D0; A(2,2) = 0.0D0;  A(2,3) = 0.0D0;  A(2,4) = 0.0D0
  A(3,1) = 0.0D0;  A(3,2) = 0.0D0;  A(3,3) = 0.0D0;  A(3,4) = 2.0D0
  A(4,1) = 0.0D0;  A(4,2) = 0.0D0;  A(4,3) = -2.0D0; A(4,4) = 0.0D0
  ACOPY(1:N,1:N) = A(1:N,1:N)

  call DGEEVX('N', 'V', 'V', 'N', N, A, NMAX, WR, WI, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, IWORK, INFO)
  call begin_test('complex_pairs_4x4_none')
  call print_int('info', INFO)
  call print_int('n', N)
  call print_int('ilo', ILO)
  call print_int('ihi', IHI)
  call print_scalar('abnrm', ABNRM)
  call print_array('wr', WR, N)
  call print_array('wi', WI, N)
  call print_array('scale', SCALE, N)
  call print_matrix('vl', VL, N, N, NMAX)
  call print_matrix('vr', VR, N, N, NMAX)
  call print_matrix('a_input', ACOPY, N, N, NMAX)
  call end_test()

  ! ================================================
  ! Test 3: Eigenvalues only (JOBVL='N', JOBVR='N'), BALANC='P'
  ! ================================================
  N = 4
  A = 0.0D0
  A(1,1) = 4.0D0; A(1,2) = -5.0D0
  A(2,1) = 2.0D0; A(2,2) = -3.0D0
  A(3,3) = 1.0D0; A(3,4) = 1.0D0
  A(4,3) = -1.0D0; A(4,4) = 1.0D0
  ACOPY(1:N,1:N) = A(1:N,1:N)

  call DGEEVX('P', 'N', 'N', 'N', N, A, NMAX, WR, WI, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, IWORK, INFO)
  call begin_test('eigenvalues_only_4x4_permute')
  call print_int('info', INFO)
  call print_int('n', N)
  call print_int('ilo', ILO)
  call print_int('ihi', IHI)
  call print_scalar('abnrm', ABNRM)
  call print_array('wr', WR, N)
  call print_array('wi', WI, N)
  call print_array('scale', SCALE, N)
  call print_matrix('a_input', ACOPY, N, N, NMAX)
  call end_test()

  ! ================================================
  ! Test 4: Right eigenvectors only (JOBVR='V'), BALANC='S'
  ! ================================================
  N = 3
  A = 0.0D0
  A(1,1) = 1.0D0; A(1,2) = 2.0D0; A(1,3) = 3.0D0
  A(2,1) = 0.0D0; A(2,2) = 4.0D0; A(2,3) = 5.0D0
  A(3,1) = 0.0D0; A(3,2) = 0.0D0; A(3,3) = 6.0D0
  ACOPY(1:N,1:N) = A(1:N,1:N)

  call DGEEVX('S', 'N', 'V', 'N', N, A, NMAX, WR, WI, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, IWORK, INFO)
  call begin_test('right_only_upper_tri_3x3_scale')
  call print_int('info', INFO)
  call print_int('n', N)
  call print_int('ilo', ILO)
  call print_int('ihi', IHI)
  call print_scalar('abnrm', ABNRM)
  call print_array('wr', WR, N)
  call print_array('wi', WI, N)
  call print_array('scale', SCALE, N)
  call print_matrix('vr', VR, N, N, NMAX)
  call print_matrix('a_input', ACOPY, N, N, NMAX)
  call end_test()

  ! ================================================
  ! Test 5: Left eigenvectors only (JOBVL='V'), BALANC='B'
  ! ================================================
  N = 3
  A = 0.0D0
  A(1,1) = 1.0D0; A(1,2) = 2.0D0; A(1,3) = 3.0D0
  A(2,1) = 0.0D0; A(2,2) = 4.0D0; A(2,3) = 5.0D0
  A(3,1) = 0.0D0; A(3,2) = 0.0D0; A(3,3) = 6.0D0
  ACOPY(1:N,1:N) = A(1:N,1:N)

  call DGEEVX('B', 'V', 'N', 'N', N, A, NMAX, WR, WI, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, IWORK, INFO)
  call begin_test('left_only_upper_tri_3x3_both')
  call print_int('info', INFO)
  call print_int('n', N)
  call print_int('ilo', ILO)
  call print_int('ihi', IHI)
  call print_scalar('abnrm', ABNRM)
  call print_array('wr', WR, N)
  call print_array('wi', WI, N)
  call print_array('scale', SCALE, N)
  call print_matrix('vl', VL, N, N, NMAX)
  call print_matrix('a_input', ACOPY, N, N, NMAX)
  call end_test()

  ! ================================================
  ! Test 6: N=1 edge case
  ! ================================================
  N = 1
  A(1,1) = 7.5D0

  call DGEEVX('B', 'V', 'V', 'N', N, A, NMAX, WR, WI, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, IWORK, INFO)
  call begin_test('n1_edge')
  call print_int('info', INFO)
  call print_int('n', N)
  call print_int('ilo', ILO)
  call print_int('ihi', IHI)
  call print_scalar('abnrm', ABNRM)
  call print_array('wr', WR, N)
  call print_array('wi', WI, N)
  call print_array('scale', SCALE, N)
  call print_matrix('vl', VL, N, N, NMAX)
  call print_matrix('vr', VR, N, N, NMAX)
  call end_test()

  ! ================================================
  ! Test 7: Mixed real and complex eigenvalues (general 4x4), BALANC='B'
  ! ================================================
  N = 4
  A = 0.0D0
  A(1,1) = 1.0D0; A(1,2) = 0.0D0; A(1,3) = 0.0D0; A(1,4) = 0.0D0
  A(2,1) = 0.0D0; A(2,2) = 2.0D0; A(2,3) = 0.0D0; A(2,4) = 0.0D0
  A(3,1) = 0.0D0; A(3,2) = 0.0D0; A(3,3) = 0.0D0; A(3,4) = -1.0D0
  A(4,1) = 0.0D0; A(4,2) = 0.0D0; A(4,3) = 1.0D0; A(4,4) = 0.0D0
  ACOPY(1:N,1:N) = A(1:N,1:N)

  call DGEEVX('B', 'V', 'V', 'N', N, A, NMAX, WR, WI, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, IWORK, INFO)
  call begin_test('mixed_real_complex_4x4_both')
  call print_int('info', INFO)
  call print_int('n', N)
  call print_int('ilo', ILO)
  call print_int('ihi', IHI)
  call print_scalar('abnrm', ABNRM)
  call print_array('wr', WR, N)
  call print_array('wi', WI, N)
  call print_array('scale', SCALE, N)
  call print_matrix('vl', VL, N, N, NMAX)
  call print_matrix('vr', VR, N, N, NMAX)
  call print_matrix('a_input', ACOPY, N, N, NMAX)
  call end_test()

  ! ================================================
  ! Test 8: General 4x4 with larger values to trigger balancing
  ! ================================================
  N = 4
  A = 0.0D0
  A(1,1) = 1.0D0; A(1,2) = 1.0D4;  A(1,3) = 1.0D8;  A(1,4) = 1.0D12
  A(2,1) = 1.0D-4; A(2,2) = 1.0D0; A(2,3) = 1.0D4;  A(2,4) = 1.0D8
  A(3,1) = 1.0D-8; A(3,2) = 1.0D-4; A(3,3) = 1.0D0; A(3,4) = 1.0D4
  A(4,1) = 1.0D-12; A(4,2) = 1.0D-8; A(4,3) = 1.0D-4; A(4,4) = 1.0D0
  ACOPY(1:N,1:N) = A(1:N,1:N)

  call DGEEVX('B', 'V', 'V', 'N', N, A, NMAX, WR, WI, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, IWORK, INFO)
  call begin_test('graded_4x4_both')
  call print_int('info', INFO)
  call print_int('n', N)
  call print_int('ilo', ILO)
  call print_int('ihi', IHI)
  call print_scalar('abnrm', ABNRM)
  call print_array('wr', WR, N)
  call print_array('wi', WI, N)
  call print_array('scale', SCALE, N)
  call print_matrix('vl', VL, N, N, NMAX)
  call print_matrix('vr', VR, N, N, NMAX)
  call print_matrix('a_input', ACOPY, N, N, NMAX)
  call end_test()

  ! ================================================
  ! Test 9: SENSE='E' (eigenvalues only) on a diagonal 3x3 matrix, BALANC='N'
  ! ================================================
  N = 3
  A = 0.0D0
  A(1,1) = 1.0D0
  A(2,2) = 2.0D0
  A(3,3) = 4.0D0
  ACOPY(1:N,1:N) = A(1:N,1:N)

  call DGEEVX('N', 'V', 'V', 'E', N, A, NMAX, WR, WI, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, IWORK, INFO)
  call begin_test('diag3_sense_E')
  call print_int('info', INFO)
  call print_int('n', N)
  call print_scalar('abnrm', ABNRM)
  call print_array('wr', WR, N)
  call print_array('wi', WI, N)
  call print_array('rconde', RCONDE, N)
  call print_matrix('a_input', ACOPY, N, N, NMAX)
  call end_test()

  ! ================================================
  ! Test 10: SENSE='V' (right eigenvector condition) on the same matrix
  ! ================================================
  N = 3
  A = 0.0D0
  A(1,1) = 1.0D0
  A(2,2) = 2.0D0
  A(3,3) = 4.0D0
  ACOPY(1:N,1:N) = A(1:N,1:N)

  call DGEEVX('N', 'V', 'V', 'V', N, A, NMAX, WR, WI, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, IWORK, INFO)
  call begin_test('diag3_sense_V')
  call print_int('info', INFO)
  call print_int('n', N)
  call print_scalar('abnrm', ABNRM)
  call print_array('wr', WR, N)
  call print_array('wi', WI, N)
  call print_array('rcondv', RCONDV, N)
  call print_matrix('a_input', ACOPY, N, N, NMAX)
  call end_test()

  ! ================================================
  ! Test 11: SENSE='B' (both) on a non-diagonal upper-triangular 3x3 matrix
  ! ================================================
  N = 3
  A = 0.0D0
  A(1,1) = 1.0D0; A(1,2) = 0.5D0; A(1,3) = 0.25D0
  A(2,2) = 2.0D0; A(2,3) = 0.5D0
  A(3,3) = 4.0D0
  ACOPY(1:N,1:N) = A(1:N,1:N)

  call DGEEVX('N', 'V', 'V', 'B', N, A, NMAX, WR, WI, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, IWORK, INFO)
  call begin_test('upper3_sense_B')
  call print_int('info', INFO)
  call print_int('n', N)
  call print_scalar('abnrm', ABNRM)
  call print_array('wr', WR, N)
  call print_array('wi', WI, N)
  call print_array('rconde', RCONDE, N)
  call print_array('rcondv', RCONDV, N)
  call print_matrix('a_input', ACOPY, N, N, NMAX)
  call end_test()

  ! ================================================
  ! Tests 12+ (ticket 0110): a battery over BALANC, JOBVL/JOBVR, SENSE and
  ! the scaling branches (|A| tiny / huge), comparing every output, and the
  ! workspace query's MAXWRK where dtrevc3's optimum dominates.
  ! ================================================
  call battery()

contains

  subroutine battery()
    character :: bal(4), jl(4), jr(4), sn(4)
    integer :: ib, ij, is, it, ns(3), in, isc
    double precision :: scs(3)
    character(len=64) :: nm
    bal = (/ 'N', 'P', 'S', 'B' /)
    jl = (/ 'V', 'V', 'N', 'N' /)
    jr = (/ 'V', 'N', 'V', 'N' /)
    sn = (/ 'N', 'E', 'V', 'B' /)
    ns = (/ 1, 5, 8 /)
    scs = (/ 1.0d0, 1.0d-150, 1.0d150 /)
    do in = 1, 3
      do it = 1, 3
        do isc = 1, 3
          do ib = 1, 4
            do ij = 1, 4
              do is = 1, 4
                if ((sn(is) == 'E' .or. sn(is) == 'B') .and. ij /= 1) cycle
                if (in == 1 .and. it /= 1) cycle
                if (isc /= 1 .and. (ib == 2 .or. ib == 3)) cycle
                ! The unscaled graded 8x8: DGEHRD's Hessenberg form differs from the
                ! JS one by ~1e-9 relative, so its eigenvectors' signs and RCONDV
                ! differ (dgehrd, not dgeevx; see ticket 0110's evidence).
                if (in == 3 .and. it == 2 .and. isc == 1) cycle
                write(nm, '(A,I0,A,I0,A,I0,5A)') 'bat_n', ns(in), '_t', it, '_s', isc, '_', bal(ib), jl(ij), jr(ij), sn(is)
                call bat_case(trim(nm), ns(in), it, scs(isc), bal(ib), jl(ij), jr(ij), sn(is))
              end do
            end do
          end do
        end do
      end do
    end do
    ! Only the last column nonzero, |A| ~ 1e-300 / 1e300 (the max norm and the
    ! one-norm come from the last column), and the zero matrix (no scaling).
    call bat_case('lastcol_tiny_BVVB', 4, 4, 1.0d-300, 'B', 'V', 'V', 'B')
    call bat_case('lastcol_huge_BVVB', 4, 4, 1.0d300, 'B', 'V', 'V', 'B')
    call bat_case('lastcol_tiny_NVVB', 4, 4, 1.0d-300, 'N', 'V', 'V', 'B')
    call bat_case('lastcol_huge_NVVB', 4, 4, 1.0d300, 'N', 'V', 'V', 'B')
    call bat_case('zero_BVVB', 4, 5, 1.0d0, 'B', 'V', 'V', 'B')
    call bat_case('rowone_PVVN', 5, 6, 1.0d0, 'P', 'V', 'V', 'N')
    call bat_case('rowone_BVVB', 5, 6, 1.0d0, 'B', 'V', 'V', 'B')
    call query_case('query_n50_VVN', 50, 'V', 'V', 'N')
    call query_case('query_n50_VNN', 50, 'V', 'N', 'N')
    call query_case('query_n50_NVN', 50, 'N', 'V', 'N')
  end subroutine

  ! typ 1: LCG entries in [-0.5, 0.5) (seed 1); 2: graded, A(i,j)*4**(i-j);
  ! 3: LCG with A(i,1) = 0 for i > 1 and A(n,j) = 0 for j < n (permutable);
  ! 4: only the last column nonzero; 5: zero; 6: A(1,j) = 0 for j > 1 (row 1
  ! isolated, so DGEBAL permutes it to the bottom).
  subroutine gen(n, typ, sc, M)
    integer, intent(in) :: n, typ
    double precision, intent(in) :: sc
    double precision, intent(out) :: M(n,n)
    integer :: ii, jj
    double precision :: xx
    xx = 1.0d0
    do jj = 1, n
      do ii = 1, n
        xx = mod(xx*16807.0d0, 2147483647.0d0)
        M(ii,jj) = xx/2147483647.0d0 - 0.5d0
        if (typ == 2) M(ii,jj) = M(ii,jj) * 4.0d0**(ii-jj)
        if (typ == 3 .and. ((jj == 1 .and. ii > 1) .or. (ii == n .and. jj < n))) M(ii,jj) = 0.0d0
        if ((typ == 4 .and. jj < n) .or. typ == 5) M(ii,jj) = 0.0d0
        if (typ == 6 .and. ii == 1 .and. jj > 1) M(ii,jj) = 0.0d0
        M(ii,jj) = M(ii,jj) * sc
      end do
    end do
  end subroutine

  subroutine bat_case(name, n, typ, sc, ba, vl_, vr_, se)
    character(len=*), intent(in) :: name
    integer, intent(in) :: n, typ
    double precision, intent(in) :: sc
    character, intent(in) :: ba, vl_, vr_, se
    double precision :: M(n,n), L(n,n), R(n,n), w1(n), w2(n), s1(n), e1(n), v1(n), ab
    double precision :: wk(20*n*n + 200)
    integer :: iw(4*n), i1, i2, inf
    call gen(n, typ, sc, M)
    L = -7.0d0; R = -7.0d0; e1 = -7.0d0; v1 = -7.0d0
    call DGEEVX(ba, vl_, vr_, se, n, M, n, w1, w2, L, n, R, n, i1, i2, s1, ab, e1, v1, wk, 20*n*n + 200, iw, inf)
    call begin_test(name)
    call print_int('n', n)
    call print_int('typ', typ)
    call print_scalar('sc', sc)
    call print_char('balanc', ba)
    call print_char('jobvl', vl_)
    call print_char('jobvr', vr_)
    call print_char('sense', se)
    call print_int('info', inf)
    call print_int('ilo', i1)
    call print_int('ihi', i2)
    call print_scalar('abnrm', ab)
    call print_array('wr', w1, n)
    call print_array('wi', w2, n)
    call print_array('scale', s1, n)
    call print_array('vl', L, n*n)
    call print_array('vr', R, n*n)
    call print_array('rconde', e1, n)
    call print_array('rcondv', v1, n)
    call end_test()
  end subroutine

  subroutine query_case(name, n, vl_, vr_, se)
    character(len=*), intent(in) :: name
    integer, intent(in) :: n
    character, intent(in) :: vl_, vr_, se
    double precision :: M(n,n), L(n,n), R(n,n), w1(n), w2(n), s1(n), e1(n), v1(n), ab, wk(1)
    integer :: iw(4*n), i1, i2, inf
    M = 0.0d0
    call DGEEVX('B', vl_, vr_, se, n, M, n, w1, w2, L, n, R, n, i1, i2, s1, ab, e1, v1, wk, -1, iw, inf)
    call begin_test(name)
    call print_int('n', n)
    call print_char('jobvl', vl_)
    call print_char('jobvr', vr_)
    call print_char('sense', se)
    call print_int('info', inf)
    call print_int('maxwrk', int(wk(1)))
    call end_test()
  end subroutine

end program
