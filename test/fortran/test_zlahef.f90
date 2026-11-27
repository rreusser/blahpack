program test_zlahef
  use test_utils
  implicit none

  integer, parameter :: NMAX = 6
  complex*16 :: A(NMAX, NMAX), W(NMAX, 3)
  double precision :: A_r(2*NMAX*NMAX)
  equivalence (A, A_r)
  integer :: IPIV(NMAX), INFO, n, nb, kb
  integer, parameter :: NU = 66
  complex*16 :: B(NU, NU), W2(NU, 64)
  double precision :: B_r(2*NU*NU)
  equivalence (B, B_r)
  integer :: IPIV2(NU), i, j, t
  double precision :: x, re, im, al, rv(32)

  ! Test 1: Lower, 6x6 Hermitian, NB=3
  n = 6
  nb = 3
  A = (0.0d0, 0.0d0)
  A(1,1) = (0.01d0, 0.0d0)
  A(2,1) = (5.0d0, -1.0d0)
  A(2,2) = (0.02d0, 0.0d0)
  A(3,1) = (1.0d0, 1.0d0)
  A(3,2) = (2.0d0, -1.0d0)
  A(3,3) = (8.0d0, 0.0d0)
  A(4,1) = (0.5d0, -0.5d0)
  A(4,2) = (1.0d0, 1.0d0)
  A(4,3) = (3.0d0, 0.0d0)
  A(4,4) = (7.0d0, 0.0d0)
  A(5,1) = (2.0d0, 0.0d0)
  A(5,2) = (1.5d0, -0.5d0)
  A(5,3) = (0.0d0, 2.0d0)
  A(5,4) = (1.0d0, 0.5d0)
  A(5,5) = (6.0d0, 0.0d0)
  A(6,1) = (1.0d0, -1.0d0)
  A(6,2) = (0.0d0, -3.0d0)
  A(6,3) = (1.0d0, 0.0d0)
  A(6,4) = (2.0d0, -2.0d0)
  A(6,5) = (0.5d0, 1.0d0)
  A(6,6) = (5.0d0, 0.0d0)
  IPIV = 0
  call ZLAHEF('L', n, nb, kb, A, NMAX, IPIV, W, NMAX, INFO)
  call begin_test('lower_6x6_nb3')
  call print_int('n', n)
  call print_int('nb', nb)
  call print_int('kb', kb)
  call print_int('info', INFO)
  call print_array('A', A_r, 2*NMAX*n)
  call print_int_array('ipiv', IPIV, n)
  call end_test()

  ! Tests 2-3: Upper, N = 66, NB = 64 and 8, the LCG Hermitian matrix of
  ! test_zhetrf.f90 (seed 1). The upper row max covers rows IMAX+1..K
  ! (ticket 0108): these pin the pivots zlahef chooses there.
  do t = 1, 2
    x = 1.0d0
    B = (0.0d0, 0.0d0)
    do j = 1, NU
      do i = 1, j
        x = mod(x*16807.0d0, 2147483647.0d0)
        re = x/2147483647.0d0 - 0.5d0
        x = mod(x*16807.0d0, 2147483647.0d0)
        im = x/2147483647.0d0 - 0.5d0
        if (i == j) im = 0.0d0
        B(i,j) = dcmplx(re, im)
      end do
    end do
    if (t == 1) then
      nb = 64
    else
      nb = 8
    end if
    IPIV2 = 0
    call ZLAHEF('U', NU, nb, kb, B, NU, IPIV2, W2, NU, INFO)
    if (t == 1) then
      call begin_test('upper_66_nb64')
    else
      call begin_test('upper_66_nb8')
    end if
    call print_int('n', NU)
    call print_int('nb', nb)
    call print_int('kb', kb)
    call print_int('info', INFO)
    call print_array('A', B_r, 2*NU*NU)
    call print_int_array('ipiv', IPIV2, NU)
    call end_test()
  end do

  ! Tests 4+: the full Hermitian LCG matrix (seed 1, both triangles), both
  ! UPLO, blocked (NB < N) and whole-matrix (NB >= N) exits, optional zero
  ! rows/columns (singular, INFO), a shrunken diagonal (more 2x2 pivots), an
  ! imaginary part on the diagonal (which ZLAHEF must ignore) and a dominant
  ! A(2,2). These pin kb, IPIV and A on both branches (ticket 0110).
  call lcg_case('lower_66_nb64', 'L', 66, 64, 0, 0, 1.0d0, 0.0d0, 0.0d0)
  call lcg_case('lower_66_nb8', 'L', 66, 8, 0, 0, 1.0d0, 0.0d0, 0.0d0)
  call lcg_case('lower_66_nb2', 'L', 66, 2, 0, 0, 1.0d0, 0.0d0, 0.0d0)
  call lcg_case('upper_66_nb2', 'U', 66, 2, 0, 0, 1.0d0, 0.0d0, 0.0d0)
  call lcg_case('lower_9_nb9', 'L', 9, 9, 0, 0, 1.0d0, 0.0d0, 0.0d0)
  call lcg_case('upper_9_nb9', 'U', 9, 9, 0, 0, 1.0d0, 0.0d0, 0.0d0)
  call lcg_case('lower_9_nb12', 'L', 9, 12, 0, 0, 1.0d0, 0.0d0, 0.0d0)
  call lcg_case('upper_9_nb12', 'U', 9, 12, 0, 0, 1.0d0, 0.0d0, 0.0d0)
  call lcg_case('lower_12_nb12_zero', 'L', 12, 12, 3, 12, 1.0d0, 0.0d0, 0.0d0)
  call lcg_case('upper_12_nb12_zero', 'U', 12, 12, 1, 10, 1.0d0, 0.0d0, 0.0d0)
  call lcg_case('lower_20_nb20_smalldiag', 'L', 20, 20, 0, 0, 1.0d-3, 0.0d0, 0.0d0)
  call lcg_case('upper_20_nb20_smalldiag', 'U', 20, 20, 0, 0, 1.0d-3, 0.0d0, 0.0d0)
  call lcg_case('lower_30_nb7_smalldiag', 'L', 30, 7, 0, 0, 1.0d-3, 0.0d0, 0.0d0)
  call lcg_case('upper_30_nb7_smalldiag', 'U', 30, 7, 0, 0, 1.0d-3, 0.0d0, 0.0d0)
  call lcg_case('lower_12_nb12_zero_dirty', 'L', 12, 12, 3, 12, 1.0d0, 0.3d0, 0.0d0)
  call lcg_case('upper_12_nb12_zero_dirty', 'U', 12, 12, 1, 10, 1.0d0, 0.3d0, 0.0d0)
  call lcg_case('lower_30_nb7_dirty', 'L', 30, 7, 0, 0, 1.0d0, 0.3d0, 0.0d0)
  call lcg_case('upper_30_nb7_dirty', 'U', 30, 7, 0, 0, 1.0d0, 0.3d0, 0.0d0)
  call lcg_case('lower_12_nb12_big1', 'L', 12, 12, 0, 0, 1.0d0, 0.0d0, 5.0d0)
  call lcg_case('lower_12_nb6_big1', 'L', 12, 6, 0, 0, 1.0d0, 0.0d0, 5.0d0)

  ! Tests 24+: 4x4 real symmetric matrices whose first pivot test (lower:
  ! column 1; upper: the same matrix reversed, column 4) is an exact tie or
  ! turns on a row-max element at the end of its search range.
  al = (1.0d0 + sqrt(17.0d0)) / 8.0d0
  call tie_case('tie_absakk', (/ al, 3.0d0, 3.0d0, 3.0d0 /), (/ 1.0d0, 0.5d0, 0.25d0, 0.1d0, 0.2d0, 0.3d0 /))
  call tie_case('tie_rowmax', (/ 0.5d0*al, 3.0d0, 3.0d0, 3.0d0 /), (/ 1.0d0, 0.5d0, 0.25d0, 2.0d0, 0.2d0, 0.3d0 /))
  call tie_case('tie_aimax', (/ 0.1d0, 2.0d0*al, 3.0d0, 3.0d0 /), (/ 1.0d0, 0.5d0, 0.25d0, 2.0d0, 0.2d0, 0.3d0 /))
  call tie_case('rowmax_last', (/ 0.1d0, 1.5d0*al, 3.0d0, 3.0d0 /), (/ 1.0d0, 0.05d0, 0.05d0, 0.1d0, 2.0d0, 0.3d0 /))
  call tie_case('rowmax_mid', (/ 0.1d0, 1.5d0*al, 3.0d0, 3.0d0 /), (/ 1.0d0, 0.05d0, 0.05d0, 2.0d0, 0.1d0, 0.3d0 /))
  call tie_case('imax_last', (/ 0.3d0, 3.0d0, 3.0d0, 4.0d0 /), (/ 0.1d0, 0.1d0, 1.0d0, 0.1d0, 0.1d0, 0.1d0 /))

  ! Tests 36+: 4x4 Hermitian matrices found by search (ticket 0110) whose
  ! second pivot step is an exact tie ABSAKK = ALPHA*COLMAX after a 1x1
  ! update, where rounding leaves the row max below COLMAX, so `.GE.` and
  ! `.GT.` choose different pivots. Column-major (re, im) pairs.
  rv = (/ &
    2.959842059509755d0, 0.0d0, 0.011936738859832596d0, 0.3792299827929726d0, &
    0.18228935528653178d0, 0.26280569926034925d0, -0.27273628011938944d0, -0.1213400334219169d0, &
    0.011936738859832596d0, -0.3792299827929726d0, 0.41210063273976305d0, 0.0d0, &
    0.024612531310232555d0, 0.3371862689206313d0, 0.3619417221573842d0, -0.15452429915523358d0, &
    0.18228935528653178d0, -0.26280569926034925d0, 0.024612531310232555d0, -0.3371862689206313d0, &
    2.9103782509501923d0, 0.0d0, 0.08989590201056374d0, 0.11957490845563584d0, &
    -0.27273628011938944d0, 0.1213400334219169d0, 0.3619417221573842d0, 0.15452429915523358d0, &
    0.08989590201056374d0, -0.11957490845563584d0, 3.30451358612837d0, 0.0d0 /)
  call raw_case('lower_tie_absakk_k1', 'L', rv)
  rv = (/ &
    3.1367260965689674d0, 0.0d0, -0.04449496536724967d0, -0.17311707263491916d0, &
    0.19869986302158793d0, 0.45140219617234645d0, 0.17277548679745547d0, 0.16239339516609602d0, &
    -0.04449496536724967d0, 0.17311707263491916d0, 2.578639775085561d0, 0.0d0, &
    0.2832889313731757d0, -0.23706958896344044d0, -0.34579255657540287d0, -0.26450163720385245d0, &
    0.19869986302158793d0, -0.45140219617234645d0, 0.2832889313731757d0, 0.23706958896344044d0, &
    0.47669382259612747d0, 0.0d0, 0.47901648514858286d0, 0.1699341077683187d0, &
    0.17277548679745547d0, -0.16239339516609602d0, -0.34579255657540287d0, 0.26450163720385245d0, &
    0.47901648514858286d0, -0.1699341077683187d0, 2.59455135049976d0, 0.0d0 /)
  call raw_case('upper_tie_absakk_k2', 'U', rv)

contains

  ! diag = A11..A44, off = A21, A31, A41, A32, A42, A43 (real symmetric).
  subroutine tie_case(name, diag, off)
    character(len=*), intent(in) :: name
    double precision, intent(in) :: diag(4), off(6)
    complex*16 :: M(4,4), R(4,4)
    integer :: ii, jj
    M = (0.0d0, 0.0d0)
    do ii = 1, 4
      M(ii,ii) = dcmplx(diag(ii), 0.0d0)
    end do
    M(2,1) = off(1); M(3,1) = off(2); M(4,1) = off(3)
    M(3,2) = off(4); M(4,2) = off(5); M(4,3) = off(6)
    do jj = 1, 4
      do ii = jj+1, 4
        M(jj,ii) = dconjg(M(ii,jj))
      end do
    end do
    do jj = 1, 4
      do ii = 1, 4
        R(ii,jj) = M(5-ii,5-jj)
      end do
    end do
    call emit('lower_' // name, 'L', 4, 4, M)
    call emit('upper_' // name, 'U', 4, 4, R)
  end subroutine

  subroutine raw_case(name, uplo, v)
    character(len=*), intent(in) :: name
    character, intent(in) :: uplo
    double precision, intent(in) :: v(32)
    complex*16 :: M(4,4)
    integer :: ii, jj
    do jj = 1, 4
      do ii = 1, 4
        M(ii,jj) = dcmplx(v(2*((jj-1)*4+ii)-1), v(2*((jj-1)*4+ii)))
      end do
    end do
    call emit(name, uplo, 4, 4, M)
  end subroutine

  subroutine lcg_case(name, uplo, n, nb, z1, z2, dscale, dimg, big1)
    character(len=*), intent(in) :: name
    character, intent(in) :: uplo
    integer, intent(in) :: n, nb, z1, z2
    double precision, intent(in) :: dscale, dimg, big1
    complex*16, allocatable :: C(:,:)
    integer :: ii, jj
    double precision :: xx, rr, mm
    allocate(C(n,n))
    xx = 1.0d0
    C = (0.0d0, 0.0d0)
    do jj = 1, n
      do ii = 1, jj
        xx = mod(xx*16807.0d0, 2147483647.0d0)
        rr = xx/2147483647.0d0 - 0.5d0
        xx = mod(xx*16807.0d0, 2147483647.0d0)
        mm = xx/2147483647.0d0 - 0.5d0
        if (ii == jj) then
          C(ii,jj) = dcmplx(rr*dscale, dimg)
        else
          C(ii,jj) = dcmplx(rr, mm)
          C(jj,ii) = dcmplx(rr, -mm)
        end if
      end do
    end do
    do ii = 1, n
      if (ii == z1 .or. ii == z2) then
        C(ii,:) = (0.0d0, 0.0d0)
        C(:,ii) = (0.0d0, 0.0d0)
        C(ii,ii) = dcmplx(0.0d0, dimg)
      end if
    end do
    if (big1 /= 0.0d0) C(2,2) = dcmplx(big1, dimg)
    call emit(name, uplo, n, nb, C)
    deallocate(C)
  end subroutine

  subroutine emit(name, uplo, n, nb, C)
    character(len=*), intent(in) :: name
    character, intent(in) :: uplo
    integer, intent(in) :: n, nb
    complex*16, intent(inout) :: C(n,n)
    complex*16, allocatable :: WW(:,:)
    double precision, allocatable :: C_r(:)
    integer, allocatable :: IP(:)
    integer :: ii, jj, kb2, info2
    allocate(WW(n,nb), C_r(2*n*n), IP(n))
    IP = 0
    WW = (0.0d0, 0.0d0)
    call ZLAHEF(uplo, n, nb, kb2, C, n, IP, WW, n, info2)
    do jj = 1, n
      do ii = 1, n
        C_r(2*((jj-1)*n+ii)-1) = dble(C(ii,jj))
        C_r(2*((jj-1)*n+ii)) = dimag(C(ii,jj))
      end do
    end do
    call begin_test(name)
    call print_int('n', n)
    call print_int('nb', nb)
    call print_int('kb', kb2)
    call print_int('info', info2)
    call print_array('A', C_r, 2*n*n)
    call print_int_array('ipiv', IP, n)
    call end_test()
    deallocate(WW, C_r, IP)
  end subroutine

end program
