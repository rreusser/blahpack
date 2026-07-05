program test_dseupd
  use test_utils
  implicit none

  ! The ARPACK /debug/ COMMON block (declared here in free form since the
  ! shipped debug.h is fixed-form and cannot be `include`d into a .f90 file).
  integer :: logfil, ndigit, mgetv0, msaupd, msaup2, msaitr, mseigt, &
             msapps, msgets, mseupd, mnaupd, mnaup2, mnaitr, mneigh, &
             mnapps, mngets, mneupd, mcaupd, mcaup2, mcaitr, mceigh, &
             mcapps, mcgets, mceupd
  common /debug/ logfil, ndigit, mgetv0, msaupd, msaup2, msaitr, mseigt, &
             msapps, msgets, mseupd, mnaupd, mnaup2, mnaitr, mneigh, &
             mnapps, mngets, mneupd, mcaupd, mcaup2, mcaitr, mceigh, &
             mcapps, mcgets, mceupd

  ! Silence all internal trace output (dvout / ivout / dmout are guarded
  ! by msglvl > k; with every level 0 nothing is printed).
  logfil = 6
  ndigit = -3
  mgetv0 = 0
  msaupd = 0
  msaup2 = 0
  msaitr = 0
  mseigt = 0
  msapps = 0
  msgets = 0
  mseupd = 0

  ! Standard symmetric problem A*x = lambda*x with A the [-1, 2, -1]
  ! tridiagonal (1-D Laplacian), mode 1, bmat = 'I'. Each case drives the
  ! full dsaupd reverse-communication loop to convergence, records the exact
  ! post-convergence state consumed by dseupd (v, workl, workd, resid,
  ! iparam, ipntr) and then records the dseupd outputs (d, z, info).
  call run_case('LM', .true.,  'lm_rvec_n10_nev3_ncv6')
  call run_case('LA', .true.,  'la_rvec_n10_nev3_ncv6')
  call run_case('SA', .true.,  'sa_rvec_n10_nev3_ncv6')
  call run_case('LM', .false., 'lm_norvec_n10_nev3_ncv6')

contains

  subroutine av(n, x, y)
    integer, intent(in) :: n
    double precision, intent(in) :: x(n)
    double precision, intent(out) :: y(n)
    integer :: i
    y(1) = 2.0d0*x(1) - x(2)
    do i = 2, n-1
      y(i) = -x(i-1) + 2.0d0*x(i) - x(i+1)
    end do
    y(n) = -x(n-1) + 2.0d0*x(n)
  end subroutine

  subroutine run_case(which, rvec, name)
    character(len=2), intent(in) :: which
    logical, intent(in) :: rvec
    character(*), intent(in) :: name

    integer, parameter :: maxn = 10, maxncv = 6, ldv = 10, ldz = 10
    integer, parameter :: n = 10, nev = 3, ncv = 6

    double precision :: v(ldv, maxncv), workl(maxncv*(maxncv+8))
    double precision :: workd(3*maxn), resid(maxn)
    double precision :: d(nev), z(ldz, nev)
    logical :: select(maxncv)
    integer :: iparam(11), ipntr(11)

    character :: bmat*1
    integer :: ido, lworkl, info, ierr, nconv
    double precision :: tol, sigma

    bmat = 'I'
    lworkl = ncv*(ncv+8)
    tol = 0.0d0
    info = 0
    ido = 0

    iparam = 0
    iparam(1) = 1     ! exact shifts
    iparam(3) = 300   ! max iterations
    iparam(7) = 1     ! mode 1

    ! Reverse-communication loop.
10  continue
    call dsaupd(ido, bmat, n, which, nev, tol, resid, ncv, v, ldv, &
                iparam, ipntr, workd, workl, lworkl, info)
    if (ido .eq. -1 .or. ido .eq. 1) then
      call av(n, workd(ipntr(1)), workd(ipntr(2)))
      go to 10
    end if

    if (info .lt. 0) then
      call begin_test(name)
      call print_int('saupd_info', info)
      call end_test()
      return
    end if

    ! Record the exact inputs consumed by dseupd BEFORE calling it (dseupd
    ! overwrites v, workl, workd, ipntr, and select in place).
    call begin_test(name)
    call print_int('n', n)
    call print_int('nev', nev)
    call print_int('ncv', ncv)
    call print_int('lworkl', lworkl)
    call print_scalar('sigma', sigma)
    call print_scalar('tol', tol)
    call print_int_array('iparam', iparam, 11)
    call print_int_array('ipntr', ipntr, 11)
    call print_matrix('v', v, ldv, n, ncv)
    call print_array('workl', workl, lworkl)
    call print_array('workd', workd, 2*n)
    call print_array('resid', resid, n)

    sigma = 0.0d0
    call dseupd(rvec, 'All', select, d, z, ldz, sigma, bmat, n, which, &
                nev, tol, resid, ncv, v, ldv, iparam, ipntr, workd, &
                workl, lworkl, ierr)

    nconv = iparam(5)
    call print_int('nconv', nconv)
    call print_int('info', ierr)
    call print_array('d', d, nconv)
    if (rvec) then
      call print_matrix('z', z, ldz, n, nconv)
    end if
    call end_test()
  end subroutine

end program test_dseupd
