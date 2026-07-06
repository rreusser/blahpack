program test_dsband
  use test_utils
  implicit none
  integer, parameter :: MAXN = 24, MAXNCV = 12
  integer, parameter :: MAXBDW = 4, LDA = MAXBDW, LDV = MAXN
  double precision :: a(LDA, MAXN), m(LDA, MAXN), rfac(LDA, MAXN)
  double precision :: v(LDV, MAXNCV), resid(MAXN), d(MAXNCV)
  double precision :: workd(3*MAXN), workl(MAXNCV*MAXNCV + 8*MAXNCV)
  integer :: iparam(11), iwork(MAXN)
  logical :: select(MAXNCV)

  ! ------------------------------------------------------------------
  ! Case 1: generalized shift-invert (type 4), mode 3, bmat='G', LM, sigma=0.
  ! K x = lambda M x with 1-D FEM Laplacian K and consistent mass M.
  call run(20, 4, 10, 3, 'G', 'LM', 0.0d0, 'gen_shiftinv_n20')

  ! ------------------------------------------------------------------
  ! Case 2: standard regular (type 1), mode 1, bmat='I', SA.
  call run(16, 3, 8, 1, 'I', 'SA', 0.0d0, 'std_regular_n16')

  ! ------------------------------------------------------------------
  ! Case 3: standard shift-invert (type 2), mode 3, bmat='I', LM, sigma=1.
  call run(16, 3, 8, 3, 'I', 'LM', 1.0d0, 'std_shiftinv_n16')

contains

  ! Build the band matrices, run dsband, and emit the fixture record.
  subroutine run(n, nev, ncv, mode, bmat, which, sigma, name)
    integer, intent(in) :: n, nev, ncv, mode
    character(*), intent(in) :: bmat, which, name
    double precision, intent(in) :: sigma
    integer :: kl, ku, idiag, isup, isub, j, info, ldz, lworkl, nconv
    double precision :: tol, h, r1, r2
    logical :: rvec

    kl = 1
    ku = 1
    idiag = kl + ku + 1
    isup = kl + ku
    isub = kl + ku + 2

    call dlaset('A', LDA, n, 0.0d0, 0.0d0, a, LDA)
    call dlaset('A', LDA, n, 0.0d0, 0.0d0, m, LDA)
    call dlaset('A', LDA, n, 0.0d0, 0.0d0, rfac, LDA)

    h = 1.0d0 / dble(n + 1)
    r1 = 4.0d0 / 6.0d0
    r2 = 1.0d0 / 6.0d0
    do j = 1, n
      a(idiag, j) = 2.0d0 / h
      m(idiag, j) = r1 * h
    end do
    do j = 1, n - 1
      a(isup, j+1) = -1.0d0 / h
      a(isub, j) = -1.0d0 / h
      m(isup, j+1) = r2 * h
      m(isub, j) = r2 * h
    end do

    ldz = LDV
    lworkl = ncv*ncv + 8*ncv
    tol = 0.0d0
    iparam = 0
    iparam(3) = 300
    iparam(7) = mode
    rvec = .true.

    ! Fixed deterministic initial residual (info != 0 => use provided resid).
    do j = 1, n
      resid(j) = 1.0d0 + 0.1d0 * dble(j)
    end do
    info = 1

    call dsband(rvec, 'A', select, d, v, ldz, sigma, n, a, m, LDA, &
                rfac, kl, ku, which, bmat, nev, tol, resid, ncv, v, LDV, &
                iparam, workd, workl, lworkl, iwork, info)

    nconv = iparam(5)
    call begin_test(name)
    call print_int('n', n)
    call print_int('nev', nev)
    call print_int('nconv', nconv)
    call print_int('mxiter', iparam(3))
    call print_int('info', info)
    call print_array('d', d, nev)
    call print_matrix('z', v, LDV, n, nconv)
    call end_test()
  end subroutine run

end program test_dsband
