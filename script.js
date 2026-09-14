let toastTimer;
  function showToast(msg, type){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'show ' + (type || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>{ t.className = t.className.replace('show',''); }, 2600);
  }

  // ---------- Password visibility ----------
  function togglePw(inputId, iconId){
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    icon.innerHTML = showing
      ? '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke-width="1.8"/><circle cx="12" cy="12" r="3" stroke-width="1.8"/>'
      : '<path d="M3 3l18 18" stroke-width="1.8" stroke-linecap="round"/><path d="M9.9 5.1A11 11 0 0 1 23 12s-1.6 2.9-4.4 4.9M6.6 6.6C3.9 8.4 2 12 2 12s4 7 11 7c1.6 0 3.1-.3 4.4-.9" stroke-width="1.8" stroke-linecap="round"/><path d="M9.9 14.1a3 3 0 0 0 4.2-4.2" stroke-width="1.8" stroke-linecap="round"/>';
  }

  // ---------- Validation helpers ----------
  function markError(el, bad){
    if(!el) return;
    el.classList[bad ? 'add' : 'remove']('error');
  }
  function isEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  // ---------- Remember the most recent registration, so login can show real details ----------
  let regData = null;

  // ---------- Register ----------
  function handleRegister(){
    const name = document.getElementById('f-name');
    const dob = document.getElementById('f-dob');
    const mobile = document.getElementById('f-mobile');
    const email = document.getElementById('f-email');
    const address = document.getElementById('f-address');
    const usertype = document.getElementById('f-usertype');
    const username = document.getElementById('f-username');
    const pass1 = document.getElementById('f-pass1');
    const pass2 = document.getElementById('f-pass2');

    let firstBad = null;
    const check = (el, ok) => { markError(el, !ok); if(!ok && !firstBad) firstBad = el; return ok; };

    let valid = true;
    valid = check(name, name.value.trim().length > 1) && valid;
    valid = check(dob, dob.value !== '') && valid;
    valid = check(mobile, /^\d{10}$/.test(mobile.value.trim())) && valid;
    valid = check(email, isEmail(email.value.trim())) && valid;
    valid = check(address, address.value.trim().length > 3) && valid;
    valid = check(username, username.value.trim().length > 2) && valid;
    valid = check(pass1, pass1.value.length >= 6) && valid;
    valid = check(pass2, pass2.value.length >= 6 && pass2.value === pass1.value) && valid;

    if(!valid){
      if(firstBad) firstBad.focus();
      showToast('Please check the highlighted fields and try again.', 'error');
      return;
    }

    regData = {
      name: name.value.trim(),
      email: email.value.trim(),
      mobile: mobile.value.trim(),
      address: address.value.trim(),
      usertype: usertype.value,
      username: username.value.trim()
    };

    showToast('Registration successful! Redirecting to login…', 'success');
    setTimeout(()=>{
      document.getElementById('l-user').value = regData.username;
      openLogin();
    }, 1100);
  }

  // ---------- Clear ----------
  function clearForm(){
    document.getElementById('regForm').reset();
    document.querySelectorAll('#regForm .error').forEach(el => el.classList.remove('error'));
    ['f-pass1','f-pass2'].forEach(id=>{
      const input = document.getElementById(id);
      if(input.type === 'text') togglePw(id, id + '-icon');
    });
    showToast('Form cleared.', 'info');
  }

  // ---------- Login modal ----------
  function openLogin(){
    if(isLoggedIn){ location.hash = '#/dashboard'; return; }
    location.hash = '#/login';
  }
  function closeLogin(){
    if(location.hash === '#/login') location.hash = '#/register';
  }
  let isLoggedIn = false;

  function handleLogin(){
    const user = document.getElementById('l-user');
    const pass = document.getElementById('l-pass');
    let valid = true;
    if(user.value.trim() === ''){ markError(user, true); valid = false; } else markError(user, false);
    if(pass.value.trim() === ''){ markError(pass, true); valid = false; } else markError(pass, false);

    if(!valid){
      showToast('Enter your username and password.', 'error');
      return;
    }

    pendingUsername = user.value.trim();
    isLoggedIn = true;
    showToast('Login successful! Welcome, ' + pendingUsername + '.', 'success');
    setTimeout(()=>{ location.hash = '#/dashboard'; }, 700);
  }

  // ---------- Dashboard / profile page ----------
  let pendingUsername = null;

  function renderDashboard(username){
    // Use the details from registration if this username just signed up,
    // otherwise fall back to sample data so the page still looks real.
    const data = (regData && regData.username === username) ? regData : {
      name: username,
      email: username.includes('@') ? username : username + '@example.com',
      mobile: '98765 43210',
      address: 'Not provided',
      usertype: 'Patient',
      username: username
    };

    document.getElementById('dash-avatar').textContent = data.name.trim().charAt(0).toUpperCase();
    document.getElementById('dash-name').textContent = data.name;
    document.getElementById('dash-role').textContent = data.usertype;
    document.getElementById('dash-username').textContent = data.username;
    document.getElementById('dash-email').textContent = data.email;
    document.getElementById('dash-mobile').textContent = data.mobile;
    document.getElementById('dash-address').textContent = data.address;
  }

  function showRegisterView(){
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('stage-register').style.display = 'flex';
    if(window.matchMedia('(min-width:1280px)').matches){
      document.querySelector('.decor-left').style.display = 'block';
      document.querySelector('.decor-right').style.display = 'block';
    }
    document.getElementById('nav-login-label').textContent = 'Login';
    closeLoginModal();
  }

  function showDashboardView(){
    renderDashboard(pendingUsername || (regData ? regData.username : 'Guest'));
    document.getElementById('stage-register').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    document.querySelector('.decor-left').style.display = 'none';
    document.querySelector('.decor-right').style.display = 'none';
    document.getElementById('nav-login-label').textContent = 'Logout';
    closeLoginModal();
  }

  function openLoginModal(){ document.getElementById('loginModal').classList.add('show'); }
  function closeLoginModal(){ document.getElementById('loginModal').classList.remove('show'); }

  function logout(){
    isLoggedIn = false;
    pendingUsername = null;
    location.hash = '#/register';
    showToast('You have been logged out.', 'info');
  }

  // ---------- Router: keeps the URL in sync with the visible screen ----------
  function route(){
    const hash = location.hash || '#/register';
    if(hash === '#/dashboard'){
      if(isLoggedIn){
        showRegisterView();      // reset base layer first
        showDashboardView();
      } else {
        location.hash = '#/login';
      }
    } else if(hash === '#/login'){
      showRegisterView();
      openLoginModal();
    } else {
      showRegisterView();
    }
  }
  window.addEventListener('hashchange', route);
  window.addEventListener('DOMContentLoaded', () => {
    if(!location.hash) location.hash = '#/register'; else route();
  });

  // close modal on backdrop click (returns to register, doesn't log in)
  document.getElementById('loginModal').addEventListener('click', function(e){
    if(e.target === this) closeLogin();
  });