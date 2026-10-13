/* ===== SiteCraft shared behavior ===== */
const WHATSAPP_NUMBER = "919910276130";
const isFinePointer = window.matchMedia('(pointer:fine)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function waLink(message){
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/* ---------- Navbar (desktop) ---------- */
function initNavbar(){
  const navbarWrap = document.getElementById('navbarWrap');
  if (!navbarWrap) return;
  window.addEventListener('scroll', () => {
    navbarWrap.classList.toggle('scrolled', window.scrollY > 30);
  }, {passive:true});

  const page = document.body.getAttribute('data-page');
  if (page){
    document.querySelectorAll(`.nav-links a[data-nav="${page}"]`).forEach(a => a.classList.add('active'));
  }
}

/* ---------- Fullscreen mobile menu ---------- */
function initMobileMenu(){
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenuFull');
  if (!hamburger || !menu) return;
  const closeBtn = menu.querySelector('.mmf-close');

  function open(){
    menu.classList.add('open');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function close(){
    menu.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  hamburger.addEventListener('click', () => {
    menu.classList.contains('open') ? close() : open();
  });
  if (closeBtn) closeBtn.addEventListener('click', close);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  const page = document.body.getAttribute('data-page');
  if (page){
    menu.querySelectorAll(`a[data-nav="${page}"]`).forEach(a => a.classList.add('active'));
  }
}

/* ---------- Scroll reveal ---------- */
function initReveal(){
  document.querySelectorAll('.stagger').forEach(group => {
    Array.from(group.children).forEach((child, i) => child.style.setProperty('--i', i));
  });
  const revealEls = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || prefersReducedMotion){
    revealEls.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, {threshold:0.12, rootMargin:'0px 0px -60px 0px'});
  revealEls.forEach(el => io.observe(el));
}

/* ---------- Ticker ---------- */
function initTicker(){
  const track = document.getElementById('tickerTrack');
  if (!track) return;
  const items = ['SHOPIFY','ECOMMERCE','MOBILE-FIRST','CONVERSION-FOCUSED','BUILT FOR GROWTH'];
  const build = () => items.map(t => `<span><i></i>${t}</span>`).join('');
  track.innerHTML = build() + build();
}

/* ---------- FAQ accordion ---------- */
function initFAQ(){
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o => {
        if (o !== item){
          o.classList.remove('open');
          o.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      item.classList.toggle('open', !isOpen);
      a.style.maxHeight = !isOpen ? a.scrollHeight + 'px' : null;
    });
  });
}

/* ---------- Hero parallax (mouse-follow, desktop only) ---------- */
function initHeroParallax(){
  if (!isFinePointer || prefersReducedMotion) return;
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const browser = hero.querySelector('.hv-browser');
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    if (browser){
      browser.style.setProperty('--parallax-x', `${px * 10}px`);
      browser.style.setProperty('--parallax-y', `${py * 10}px`);
    }
  }, {passive:true});
}

/* ---------- Magnetic buttons (desktop only) ---------- */
function initMagnetic(){
  if (!isFinePointer || prefersReducedMotion) return;
  if (typeof window.gsap !== 'undefined') return; // motion-engine.js provides the GSAP-driven version instead
  document.querySelectorAll('.btn-magnetic').forEach(btn => {
    if (btn.dataset.magneticBound) return;
    btn.dataset.magneticBound = 'true';
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ---------- Tilt cards (desktop only, subtle) ---------- */
function initTilt(){
  if (!isFinePointer || prefersReducedMotion) return;
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 6;
      const rotateX = (0.5 - py) * 6;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ---------- Process timeline scroll highlight ---------- */
function initTimeline(){
  const steps = document.querySelectorAll('.timeline-step');
  const fill = document.querySelector('.timeline-line-fill');
  if (!steps.length) return;

  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('in-view');
      });
    }, {threshold:0.4, rootMargin:'0px 0px -10% 0px'});
    steps.forEach(s => io.observe(s));
  } else {
    steps.forEach(s => s.classList.add('in-view'));
  }

  if (fill && !prefersReducedMotion){
    const track = document.querySelector('.timeline');
    const updateFill = () => {
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (vh * 0.75 - rect.top) / rect.height));
      fill.style.height = `${progress * 100}%`;
    };
    window.addEventListener('scroll', updateFill, {passive:true});
    updateFill();
  } else if (fill){
    fill.style.height = '100%';
  }
}

/* ---------- WhatsApp float button ---------- */
function initWaFloat(){
  const el = document.getElementById('waFloat');
  if (!el) return;
  el.href = waLink("Hello SiteCraft, I'd like to know more about your Shopify website packages.");
  el.target = '_blank';
  el.rel = 'noopener';
}

/* ---------- Direct WhatsApp buttons ---------- */
function initDirectWhatsApp(){
  document.querySelectorAll('[data-wa-generic]').forEach(a => {
    a.href = waLink("Hello SiteCraft, I'd like to know more about your Shopify website packages.");
    a.target = '_blank';
    a.rel = 'noopener';
  });
}

/* ---------- Coming Soon modal ---------- */
function initComingSoonModal(){
  const root = document.getElementById('comingSoonModalRoot');
  if (!root) return;

  root.innerHTML = `
    <div class="modal-overlay" id="csOverlay">
      <div class="modal-box cs-modal-box" role="dialog" aria-modal="true">
        <button type="button" class="modal-close" id="csClose" aria-label="Close">&times;</button>
        <div class="cs-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
        </div>
        <h3 id="csServiceName">This service</h3>
        <p>SiteCraft is preparing this service. We'll be launching it soon — reach out on WhatsApp and we'll let you know the moment it's live.</p>
        <a href="#" class="btn btn-whatsapp btn-block btn-magnetic" id="csNotifyBtn">
          <span>Notify Me on WhatsApp</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
      </div>
    </div>
  `;

  const overlay = document.getElementById('csOverlay');
  const closeBtn = document.getElementById('csClose');
  const nameEl = document.getElementById('csServiceName');
  const notifyBtn = document.getElementById('csNotifyBtn');

  function open(serviceName){
    nameEl.textContent = serviceName;
    notifyBtn.href = waLink(`Hello SiteCraft, please notify me when ${serviceName} launches.`);
    notifyBtn.target = '_blank';
    notifyBtn.rel = 'noopener';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    initMagnetic();
    if (window.SiteCraftMotion && window.SiteCraftMotion.upgradeMagnetic) window.SiteCraftMotion.upgradeMagnetic();
  }
  function close(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.coming-card[data-service]').forEach(card => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', () => open(card.dataset.service));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(card.dataset.service); } });
  });

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('open')) close(); });
}

/* ---------- Enquiry wizard modal (5 steps -> WhatsApp) ---------- */
function initEnquiryModal(){
  const root = document.getElementById('enquiryModalRoot');
  if (!root) return;

  const packages = [
    {name:'Basic', price:'₹3,999', sub:'Starting your online journey'},
    {name:'Standard', price:'₹8,999', sub:'Most popular — growing businesses'},
    {name:'Premium', price:'₹11,999', sub:'A more advanced Shopify presence'},
  ];
  const requirements = ['New Shopify Store', 'Redesign Existing Store', 'Need Help Deciding'];
  const productRanges = ['0–10 products', '11–30 products', '31–50 products', 'Custom / not sure'];
  const addonsList = [
    'None for now',
    'Google Ads (Coming Soon)',
    'Meta Ads (Coming Soon)',
    'Social Media Management (Coming Soon)',
    'Influencer Marketing (Coming Soon)',
    'AI-Generated Graphics (Coming Soon)',
  ];

  root.innerHTML = `
    <div class="modal-overlay" id="modalOverlay">
      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <button type="button" class="modal-close" id="modalClose" aria-label="Close enquiry form">&times;</button>
        <div class="wizard-steps-indicator" id="wizardIndicator">
          <span data-s="0"></span><span data-s="1"></span><span data-s="2"></span><span data-s="3"></span><span data-s="4"></span>
        </div>

        <div class="wizard-panel active" data-panel="0">
          <span class="label wizard-title">Step 1 of 5</span>
          <h3 style="font-size:20px;margin-bottom:16px;">Choose your package</h3>
          <div class="wizard-choice-grid" id="wzPackages">
            ${packages.map(p => `
              <div class="wizard-choice" data-value="${p.name}">
                <div><span class="wc-name">${p.name}</span><br><span class="wc-sub">${p.sub}</span></div>
                <span class="wc-price">${p.price}</span>
              </div>`).join('')}
          </div>
          <div class="wizard-nav"><button type="button" class="btn btn-primary btn-magnetic" data-next disabled>Continue</button></div>
        </div>

        <div class="wizard-panel" data-panel="1">
          <span class="label wizard-title">Step 2 of 5</span>
          <h3 style="font-size:20px;margin-bottom:16px;">What do you need?</h3>
          <div class="wizard-choice-grid" id="wzRequirement">
            ${requirements.map(r => `<div class="wizard-choice" data-value="${r}"><span class="wc-name">${r}</span></div>`).join('')}
          </div>
          <div class="wizard-nav"><button type="button" class="btn btn-outline" data-back>Back</button><button type="button" class="btn btn-primary btn-magnetic" data-next disabled>Continue</button></div>
        </div>

        <div class="wizard-panel" data-panel="2">
          <span class="label wizard-title">Step 3 of 5</span>
          <h3 style="font-size:20px;margin-bottom:16px;">How many products?</h3>
          <div class="wizard-choice-grid" id="wzProducts">
            ${productRanges.map(r => `<div class="wizard-choice" data-value="${r}"><span class="wc-name">${r}</span></div>`).join('')}
          </div>
          <div class="wizard-nav"><button type="button" class="btn btn-outline" data-back>Back</button><button type="button" class="btn btn-primary btn-magnetic" data-next disabled>Continue</button></div>
        </div>

        <div class="wizard-panel" data-panel="3">
          <span class="label wizard-title">Step 4 of 5</span>
          <h3 style="font-size:20px;margin-bottom:16px;">Additional services</h3>
          <p style="font-size:13px;color:var(--muted);margin-bottom:14px;">Optional — select any you'd like to hear about. Marketing services are coming soon.</p>
          <div class="wizard-choice-grid" id="wzAddons">
            ${addonsList.map(a => `<div class="wizard-choice" data-value="${a}"><span class="wc-name">${a}</span></div>`).join('')}
          </div>
          <div class="wizard-nav"><button type="button" class="btn btn-outline" data-back>Back</button><button type="button" class="btn btn-primary btn-magnetic" data-next>Continue</button></div>
        </div>

        <div class="wizard-panel" data-panel="4">
          <span class="label wizard-title">Step 5 of 5</span>
          <h3 style="font-size:20px;margin-bottom:6px;">Your details</h3>
          <div class="wizard-summary" id="wzSummary"></div>
          <form id="enquiryForm" class="form" novalidate>
            <div class="form-row">
              <label for="eq-name">Name
                <input type="text" id="eq-name" name="name" required autocomplete="name">
              </label>
            </div>
            <div class="form-row">
              <label for="eq-business">Business Name
                <input type="text" id="eq-business" name="business" autocomplete="organization">
              </label>
            </div>
            <div class="form-row two-col">
              <label for="eq-phone">Phone Number
                <input type="tel" id="eq-phone" name="phone" required autocomplete="tel">
              </label>
              <label for="eq-email">Email
                <input type="email" id="eq-email" name="email" autocomplete="email">
              </label>
            </div>
            <div class="form-row">
              <label for="eq-msg">Message
                <textarea id="eq-msg" name="message" rows="2" placeholder="Anything else we should know?"></textarea>
              </label>
            </div>
            <div class="wizard-nav">
              <button type="button" class="btn btn-outline" data-back>Back</button>
              <button type="submit" class="btn btn-whatsapp btn-magnetic">
                <span>Continue on WhatsApp</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.2-.5.1-.2 0-.4 0-.5-.1-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.3 0 1.4 1 2.7 1.1 2.9.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.6-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3z"/><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.2-.4-4.5-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  `;

  const overlay = document.getElementById('modalOverlay');
  const closeBtn = document.getElementById('modalClose');
  const panels = Array.from(root.querySelectorAll('.wizard-panel'));
  const indicator = Array.from(root.querySelectorAll('#wizardIndicator span'));
  const form = document.getElementById('enquiryForm');
  const summaryBox = document.getElementById('wzSummary');
  let step = 0;
  let lastFocused = null;
  const state = {package:'', price:'', requirement:'', products:'', addons:[]};

  function paintIndicator(){
    indicator.forEach((s,i) => s.classList.toggle('done', i <= step));
  }
  function showStep(i){
    panels.forEach(p => p.classList.toggle('active', Number(p.dataset.panel) === i));
    step = i;
    paintIndicator();
    if (i === 4){
      summaryBox.innerHTML = `<strong>${state.package}</strong> (${state.price}) &middot; ${state.requirement} &middot; ${state.products}${state.addons.length ? ' &middot; ' + state.addons.join(', ') : ''}`;
    }
  }

  function wireChoiceGroup(containerId, stateKey, multi){
    const container = document.getElementById(containerId);
    const nextBtn = container.parentElement.querySelector('[data-next]');
    container.querySelectorAll('.wizard-choice').forEach(choice => {
      choice.addEventListener('click', () => {
        if (multi){
          choice.classList.toggle('selected');
          const val = choice.dataset.value;
          if (choice.classList.contains('selected')) state[stateKey].push(val);
          else state[stateKey] = state[stateKey].filter(v => v !== val);
        } else {
          container.querySelectorAll('.wizard-choice').forEach(c => c.classList.remove('selected'));
          choice.classList.add('selected');
          state[stateKey] = choice.dataset.value;
          if (stateKey === 'package'){
            const pkg = packages.find(p => p.name === choice.dataset.value);
            state.price = pkg ? pkg.price : '';
          }
        }
        if (nextBtn) nextBtn.disabled = false;
      });
    });
  }

  wireChoiceGroup('wzPackages', 'package', false);
  wireChoiceGroup('wzRequirement', 'requirement', false);
  wireChoiceGroup('wzProducts', 'products', false);
  wireChoiceGroup('wzAddons', 'addons', true);

  root.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => showStep(Math.min(step + 1, 4)));
  });
  root.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => showStep(Math.max(step - 1, 0)));
  });

  function preselectPackage(pkgName, price){
    const container = document.getElementById('wzPackages');
    const match = Array.from(container.querySelectorAll('.wizard-choice')).find(c => c.dataset.value === pkgName);
    if (match){
      container.querySelectorAll('.wizard-choice').forEach(c => c.classList.remove('selected'));
      match.classList.add('selected');
      state.package = pkgName;
      state.price = price;
      const nextBtn = container.parentElement.querySelector('[data-next]');
      if (nextBtn) nextBtn.disabled = false;
    }
  }

  function resetWizard(){
    state.package = ''; state.price = ''; state.requirement = ''; state.products = ''; state.addons = [];
    root.querySelectorAll('.wizard-choice.selected').forEach(c => c.classList.remove('selected'));
    root.querySelectorAll('[data-next]').forEach(b => { if (b.closest('[data-panel="3"]') === null) b.disabled = true; });
    showStep(0);
  }

  function openModal(pkgName, price){
    lastFocused = document.activeElement;
    resetWizard();
    if (pkgName) preselectPackage(pkgName, price);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    initMagnetic();
    if (window.SiteCraftMotion && window.SiteCraftMotion.upgradeMagnetic) window.SiteCraftMotion.upgradeMagnetic();
  }
  function closeModal(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('[data-package]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(btn.dataset.package, btn.dataset.price);
    });
  });
  document.querySelectorAll('[data-open-wizard]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal(); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const message =
`Hello SiteCraft,
I am interested in the ${state.package || 'a'} package${state.price ? ' (' + state.price + ')' : ''}.

Business: ${data.get('business') || '-'}
Name: ${data.get('name') || '-'}
Phone: ${data.get('phone') || '-'}
Email: ${data.get('email') || '-'}
Requirement: ${state.requirement || '-'}
Products: ${state.products || '-'}
Additional Services: ${state.addons.length ? state.addons.join(', ') : 'None'}
Message: ${data.get('message') || '-'}

Please share the next steps.`;

    window.open(waLink(message), '_blank', 'noopener');
    closeModal();
    form.reset();
  });
}

/* ---------- Contact page form ---------- */
function initContactForm(){
  const form = document.getElementById('contactForm');
  if (!form) return;
  const status = document.createElement('p');
  status.className = 'form-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  form.appendChild(status);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = '';
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const message =
`Hello SiteCraft,

Name: ${data.get('name') || '-'}
Business Name: ${data.get('business') || '-'}
Phone: ${data.get('phone') || '-'}
Email: ${data.get('email') || '-'}
Project Type: ${data.get('projectType') || '-'}
Package: ${data.get('package') || '-'}
Message: ${data.get('message') || '-'}`;

    const whatsappUrl = waLink(message);
    const whatsappWindow = window.open(whatsappUrl, '_blank');
    if (whatsappWindow) {
      whatsappWindow.opener = null;
      status.textContent = 'Your enquiry is ready in WhatsApp. Review it there and press Send to contact SiteCraft.';
      form.reset();
    } else {
      status.replaceChildren(document.createTextNode('Your browser blocked the WhatsApp window. '));
      const fallback = document.createElement('a');
      fallback.href = whatsappUrl;
      fallback.target = '_blank';
      fallback.rel = 'noopener noreferrer';
      fallback.textContent = 'Open your enquiry in WhatsApp';
      status.append(fallback, document.createTextNode('.'));
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initReveal();
  initTicker();
  initFAQ();
  initHeroParallax();
  initMagnetic();
  initTilt();
  initTimeline();
  initWaFloat();
  initDirectWhatsApp();
  initComingSoonModal();
  initEnquiryModal();
  initContactForm();
});
