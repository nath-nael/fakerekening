// ===== STATE =====
const state = {
    currentScreen: 'screen-splash',
    currentStep: 1,
    uploadDone: false,
    callTimer: null,
    callSeconds: 0,
    chatOpen: false,
    micOn: true,
    scriptIndex: 0,
  };
  
  // ===== CALL SCRIPT =====
  const callScript = [
    { delay: 1500,  sender: 'cs',   text: 'Selamat siang, saya Sarah dari Customer Service Bank ABC. Dengan Bapak Budi Santoso?' },
    { delay: 4000,  sender: 'user', text: 'Iya benar, saya Budi Santoso.' },
    { delay: 7000,  sender: 'cs',   text: 'Baik Pak Budi. Saya akan memverifikasi identitas Bapak. Bisa tunjukkan KTP Bapak ke kamera?' },
    { delay: 11000, sender: 'user', text: 'Ini KTP saya Mbak.' },
    { delay: 14000, sender: 'cs',   text: 'Terima kasih. Wajah Bapak sudah cocok dengan foto KTP. Bisa sebutkan tanggal lahir Bapak?' },
    { delay: 18000, sender: 'user', text: '25 September 1987.' },
    { delay: 21000, sender: 'cs',   text: 'Benar. Alamat sesuai KTP?' },
    { delay: 24000, sender: 'user', text: 'Jl. Mawar No. 12, Kebon Jeruk, Jakarta Barat.' },
    { delay: 27000, sender: 'cs',   text: 'Sempurna! Semua data sudah terverifikasi. Rekening Bapak akan segera aktif. Ada yang ingin ditanyakan?' },
    { delay: 31000, sender: 'user', text: 'Tidak ada, terima kasih Mbak Sarah.' },
    { delay: 34000, sender: 'cs',   text: 'Sama-sama Pak Budi! Rekening Tabungan ABC Reguler Bapak sudah aktif. Selamat bergabung! 😊' },
    { delay: 38000, sender: 'system', text: '✅ Verifikasi selesai — Rekening berhasil dibuka' },
  ];
  
  // ===== NAVIGATION =====
  function goTo(screenId) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.style.display = 'none';
    });
    const target = document.getElementById(screenId);
    target.style.display = 'flex';
    target.classList.add('active');
    state.currentScreen = screenId;
  
    if (screenId === 'screen-videocall') {
      startVideoCall();
    }
    window.scrollTo(0, 0);
  }
  
  // ===== SPLASH SCREEN =====
  function runSplash() {
    const fill = document.getElementById('splashLoader');
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 8 + 2;
      if (progress >= 100) {
        progress = 100;
        fill.style.width = '100%';
        clearInterval(interval);
        setTimeout(() => goTo('screen-home'), 400);
      } else {
        fill.style.width = progress + '%';
      }
    }, 80);
  }
  
  // ===== UPLOAD SIMULATION =====
  function simulateUpload() {
    if (state.uploadDone) return;
    const area = document.getElementById('uploadArea');
    area.innerHTML = `
      <div class="upload-icon"><i class="fas fa-spinner fa-spin"></i></div>
      <h3>Memproses KTP...</h3>
      <p>Sedang menganalisis dan memverifikasi data KTP</p>
    `;
    area.style.cursor = 'default';
  
    setTimeout(() => {
      area.style.display = 'none';
      const preview = document.getElementById('ktpPreview');
      const btn = document.getElementById('btnStep1');
      preview.style.display = 'block';
      btn.style.display = 'flex';
      state.uploadDone = true;
  
      // Animate KTP appearing
      preview.style.opacity = '0';
      preview.style.transform = 'translateY(20px)';
      preview.style.transition = 'all 0.4s ease';
      requestAnimationFrame(() => {
        preview.style.opacity = '1';
        preview.style.transform = 'translateY(0)';
      });
    }, 2500);
  }
  
  // ===== STEP NAVIGATION =====
  function nextStep(step) {
    // Validation
    if (step === 3) {
      const hp = document.getElementById('f-hp').value;
      const email = document.getElementById('f-email').value;
      if (!hp || !email) {
        showToast('Lengkapi nomor telepon dan email terlebih dahulu', 'warning');
        return;
      }
    }
    if (step === 4) {
      const jenis = document.getElementById('f-jenis').value;
      const tujuan = document.getElementById('f-tujuan').value;
      const syarat = document.getElementById('chk-syarat').checked;
    //   if (!jenis || !tujuan) {
    //     showToast('Lengkapi semua field yang wajib diisi', 'warning');
    //     return;
    //   }
      if (!syarat) {
        showToast('Anda harus menyetujui syarat & ketentuan', 'warning');
        return;
      }
    }
  
    // Hide all panels
    document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.step-line').forEach(l => l.classList.remove('done'));
  
    // Show target panel
    document.getElementById(`panel-step${step}`).classList.add('active');
    document.getElementById(`step${step}`).classList.add('active');
  
    // Mark previous steps as done
    for (let i = 1; i < step; i++) {
      document.getElementById(`step${i}`).classList.add('done');
      document.getElementById(`step${i}`).classList.remove('active');
    }
  
    // Mark lines as done
    const lines = document.querySelectorAll('.step-line');
    for (let i = 0; i < step - 1; i++) {
      if (lines[i]) lines[i].classList.add('done');
    }
  
    state.currentStep = step;
    document.querySelector('.screen-body').scrollTop = 0;
  }
  
  // ===== VIDEO CALL =====
  function startVideoCall() {
    state.callSeconds = 0;
    state.scriptIndex = 0;
    document.getElementById('transcriptBody').innerHTML = '';
  
    // Start timer
    state.callTimer = setInterval(() => {
      state.callSeconds++;
      const m = String(Math.floor(state.callSeconds / 60)).padStart(2, '0');
      const s = String(state.callSeconds % 60).padStart(2, '0');
      document.getElementById('vc-timer').textContent = `${m}:${s}`;
    }, 1000);
  
    // Run call script
    callScript.forEach(item => {
      setTimeout(() => {
        addMessage(item.sender, item.text);
        // Auto-show chat when messages arrive
        // if (!state.chatOpen) {
        //   document.getElementById('vcTranscript').classList.add('show');
        //   state.chatOpen = true;
        // }
      }, item.delay);
    });
  
    // Auto end call after script
    setTimeout(() => {
      endCall();
    }, 42000);
  }
  
  function addMessage(sender, text) {
    const body = document.getElementById('transcriptBody');
    const div = document.createElement('div');
  
    if (sender === 'system') {
      div.innerHTML = `<div style="text-align:center;width:100%;color:#10b981;font-size:11px;font-weight:600;padding:4px 0;">${text}</div>`;
    } else {
      div.className = `msg ${sender === 'user' ? 'user' : ''}`;
      const icon = sender === 'cs' ? 'fa-headset' : 'fa-robot';
      div.innerHTML = `
        <div class="msg-avatar"><i class="fas ${icon}"></i></div>
        <div class="msg-bubble">${text}</div>
      `;
    }
  
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }
  
  function endCall() {
    clearInterval(state.callTimer);
    state.callTimer = null;
    goTo('screen-success');
  }
  
  function toggleMic() {
    state.micOn = !state.micOn;
    const btn = document.getElementById('btnMic');
    const icon = btn.querySelector('i');
    if (state.micOn) {
      icon.className = 'fas fa-microphone';
      btn.style.background = 'rgba(255,255,255,0.15)';
    } else {
      icon.className = 'fas fa-microphone-slash';
      btn.style.background = 'rgba(239,68,68,0.4)';
    }
  }
  
  function toggleChat() {
    state.chatOpen = !state.chatOpen;
    const transcript = document.getElementById('vcTranscript');
    transcript.classList.toggle('show', state.chatOpen);
  }
  
  // ===== TOAST NOTIFICATION =====
  function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
  
    const toast = document.createElement('div');
    toast.className = 'toast';
    const colors = {
      warning: '#f59e0b',
      error: '#ef4444',
      success: '#10b981',
      info: '#1a56db',
    };
    toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: ${colors[type] || colors.info};
      color: white;
      padding: 12px 20px;
      border-radius: 24px;
      font-size: 13px;
      font-weight: 500;
      z-index: 9999;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
      white-space: nowrap;
      max-width: 90vw;
      text-align: center;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
  
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
      toast.style.opacity = '1';
    });
  
    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  
  // ===== RESET =====
  function resetApp() {
    state.uploadDone = false;
    state.currentStep = 1;
    state.chatOpen = false;
    state.micOn = true;
    state.scriptIndex = 0;
    if (state.callTimer) {
      clearInterval(state.callTimer);
      state.callTimer = null;
    }
  
    // Reset upload area
    const area = document.getElementById('uploadArea');
    area.style.display = 'block';
    area.style.cursor = 'pointer';
    area.innerHTML = `
      <div class="upload-icon"><i class="fas fa-camera"></i></div>
      <h3>Foto KTP Anda</h3>
      <p>Ketuk untuk mengambil foto atau unggah dari galeri</p>
      <button class="btn-upload">Pilih Foto KTP</button>
    `;
  
    document.getElementById('ktpPreview').style.display = 'none';
    document.getElementById('btnStep1').style.display = 'none';
    document.getElementById('f-hp').value = '';
    document.getElementById('f-email').value = '';
    document.getElementById('chk-syarat').checked = false;
    document.getElementById('vcTranscript').classList.remove('show');
  
    goTo('screen-register');
    nextStep(1);
  }
  
  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', () => {
    // Show splash
    document.getElementById('screen-splash').style.display = 'flex';
    runSplash();
  });
