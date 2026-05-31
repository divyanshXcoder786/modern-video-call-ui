(function initCallTimer() {

  const display = document.getElementById('timerDisplay');
  if (!display) return;

  let totalSeconds = 0;
  let timerInterval = null;

  /* 2-digit pad */
  function pad(n) {
    return String(n).padStart(2, '0');
  }

  /* Display update karo */
  function updateDisplay() {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    display.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;

    /* Har minute pe cyan flash */
    if (s === 0 && totalSeconds > 0) {
      display.classList.add('flash');
      setTimeout(() => display.classList.remove('flash'), 600);
    }
  }

  /* Timer start */
  function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
      totalSeconds++;
      updateDisplay();
    }, 1000);
  }

  /* Timer stop + reset */
  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    totalSeconds = 0;
    display.textContent = '00:00:00';
  }

  /* Pause / Resume toggle — display click pe */
  function toggleTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    } else {
      startTimer();
    }
  }

  /* Page load pe auto start */
  startTimer();

  /* Display click → pause/resume */
  display.style.cursor = 'pointer';
  display.title = 'Click to pause / resume timer';
  display.addEventListener('click', toggleTimer);

  /* Leave button pe timer band karo (leave button ke saath coordinate) */
  window.__stopCallTimer = function () {
    const finalTime = display.textContent;
    stopTimer();
    return finalTime;
  };

})();
/* ── Participants data ── */
const PARTICIPANTS = [
  { id:'you',     name:'You',          initials:'YO', color:'#8b5cf6', bg:'rgba(139,92,246,.2)', isYou:true  },
  { id:'andy',    name:'Andy Will',    initials:'AW', color:'#22d3ee', bg:'rgba(34,211,238,.15)'             },
  { id:'emmy',    name:'Emmy Lou',     initials:'EL', color:'#f472b6', bg:'rgba(244,114,182,.15)'            },
  { id:'tim',     name:'Tim Russel',   initials:'TR', color:'#34d399', bg:'rgba(52,211,153,.15)'             },
  { id:'jessica', name:'Jessica Bell', initials:'JB', color:'#fb923c', bg:'rgba(251,146,60,.15)'             },
];

/* ── Chat state ── */
let unreadCount = 0;
let chatTabOpen = true;

/* ── Cached elements ── */
const chatArea        = document.getElementById('chatArea');
const chatInput       = document.getElementById('chatInput');
const sendBtn         = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const typingName      = document.getElementById('typingName');
const emojiToggle     = document.getElementById('emojiToggle');
const emojiPicker     = document.getElementById('emojiPicker');
const unreadBadge     = document.getElementById('unreadBadge');
const tabBtns         = document.querySelectorAll('.tab-btn');
const tabContents     = document.querySelectorAll('.tab-content');

/* ── Helpers ── */
function getTime() {
  return new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
}
function escapeHtml(str) {
  return str
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function getParticipant(id) {
  return PARTICIPANTS.find(p => p.id === id) || PARTICIPANTS[0];
}

/* ── Render one message ── */
function renderMessage({ senderId='you', text='', time=getTime(), type='normal' }) {
  const p     = getParticipant(senderId);
  const isOwn = senderId === 'you';

  const div = document.createElement('div');
  div.className = `message${isOwn ? ' own' : ''}${type === 'system' ? ' system' : ''}`;

  if (type === 'system') {
    div.innerHTML = `<div class="msg-bubble">${escapeHtml(text)}</div>`;
  } else {
    div.innerHTML = `
      <div class="msg-meta">
        <div class="msg-avatar" style="background:${p.bg};color:${p.color}">${p.initials}</div>
        <span class="msg-name" style="color:${p.color}">${isOwn ? 'You' : p.name}</span>
        <span class="msg-time">${time}</span>
      </div>
      <div class="msg-bubble">${escapeHtml(text)}</div>
    `;
  }

  chatArea.appendChild(div);
  scrollBottom();

  /* Unread badge update */
  if (!chatTabOpen && !isOwn && type !== 'system') {
    unreadCount++;
    unreadBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
    unreadBadge.style.display = 'flex';
  }
}

/* ── Auto scroll ── */
function scrollBottom(smooth = true) {
  chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
}

/* ── Send message ── */
function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  renderMessage({ senderId:'you', text });
  chatInput.value = '';
  sendBtn.disabled = true;
  closePicker();
  scheduleReply();
}

chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('input', () => {
  sendBtn.disabled = chatInput.value.trim() === '';
});
sendBtn.disabled = true;

/* ── Typing indicator ── */
function showTyping(name) {
  typingName.textContent = name;
  typingIndicator.style.display = 'flex';
}
function hideTyping() {
  typingIndicator.style.display = 'none';
}

/* ── Simulated teammate reply ── */
const AUTO_REPLIES = [
  "Got it! 👍","Makes sense!","Agree 💯","Can you share the link?",
  "🔥 Let's go!","On it!","Noted, will follow up.",
  "Good point 🤔","✅ Sounds good!","👏 Well said!","Let me check.",
];

function scheduleReply() {
  if (Math.random() > 0.55) return;
  const bots   = PARTICIPANTS.filter(p => !p.isYou);
  const sender = bots[Math.floor(Math.random() * bots.length)];
  const reply  = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
  const td = 800  + Math.random() * 1200;
  const rd = td   + 900 + Math.random() * 700;
  setTimeout(() => showTyping(sender.name), td);
  setTimeout(() => { hideTyping(); renderMessage({ senderId:sender.id, text:reply }); }, rd);
}

/* ── Emoji picker ── */
function closePicker() {
  emojiPicker.style.display = 'none';
  emojiToggle.classList.remove('active');
}
emojiToggle.addEventListener('click', () => {
  const open = emojiPicker.style.display === 'flex';
  emojiPicker.style.display = open ? 'none' : 'flex';
  emojiToggle.classList.toggle('active', !open);
});
document.querySelectorAll('.emoji-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const emoji = btn.dataset.emoji;
    const pos   = chatInput.selectionStart;
    const val   = chatInput.value;
    chatInput.value = val.slice(0, pos) + emoji + val.slice(pos);
    chatInput.focus();
    chatInput.selectionStart = chatInput.selectionEnd = pos + emoji.length;
    sendBtn.disabled = chatInput.value.trim() === '';
  });
});
document.addEventListener('click', e => {
  if (!emojiToggle.contains(e.target) && !emojiPicker.contains(e.target)) closePicker();
});

/* ── Tabs ── */
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tabContents.forEach(tc => {
      tc.style.display = tc.id === `tab-${target}` ? 'flex' : 'none';
    });
    if (target === 'chat') {
      chatTabOpen = true;
      unreadCount = 0;
      unreadBadge.style.display = 'none';
      setTimeout(() => scrollBottom(false), 50);
    } else {
      chatTabOpen = false;
    }
  });
});

/* ── People list render ── */
(function renderPeopleList() {
  const list = document.getElementById('peopleList');
  if (!list) return;
  PARTICIPANTS.forEach(p => {
    const li = document.createElement('li');
    li.className = 'person-item';
    li.innerHTML = `
      <div class="person-avatar" style="background:${p.bg};color:${p.color}">${p.initials}</div>
      <div class="person-info">
        <div class="person-name">${p.name}</div>
        <div class="person-status">Online</div>
      </div>
      ${p.isYou ? '<span class="person-you">You</span>' : ''}
    `;
    list.appendChild(li);
  });
})();

/* ── Seed messages on load ── */
[
  { senderId:'andy',    text:"Hello Team 👋",         time:"09:00" },
  { senderId:'emmy',    text:"Hey everyone! Ready?",  time:"09:01" },
  { senderId:'jessica', text:"Let's start 🚀",        time:"09:01" },
  { senderId:'tim',     text:"Can everyone hear me?", time:"09:02" },
].forEach(m => renderMessage(m));
scrollBottom(false);
(function initMic() {
  const btn = document.getElementById('micBtn');
  if (!btn) return;
  let muted = false;
  btn.addEventListener('click', () => {
    muted = !muted;
    btn.innerHTML = muted
      ? '<i class="ti ti-microphone-off"></i>'
      : '<i class="ti ti-microphone"></i>';
    btn.classList.toggle('toggled-off', muted);
    btn.title = muted ? 'Unmute' : 'Mute';
  });
})();
(function initCamera() {
  const btn = document.getElementById('camBtn');
  if (!btn) return;
  let off = false;
  btn.addEventListener('click', () => {
    off = !off;
    btn.innerHTML = off
      ? '<i class="ti ti-video-off"></i>'
      : '<i class="ti ti-video"></i>';
    btn.classList.toggle('toggled-off', off);
    btn.title = off ? 'Camera on karo' : 'Camera band karo';
  });
})();
document.getElementById('leaveBtn')?.addEventListener('click', () => {
  if (confirm('Do you want to leave the call')) {
    const duration = window.__stopCallTimer ? window.__stopCallTimer() : '00:00:00';
    renderMessage({ senderId:'system', text:`You left the call. Duration: ${duration}`, type:'system' });
  }
}); 