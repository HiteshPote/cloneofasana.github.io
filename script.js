document.addEventListener('DOMContentLoaded', () => {

  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('shadow', window.scrollY > 8);
  });


  const ham = document.getElementById('ham');
  const mobileMenu = document.getElementById('mobileMenu');

  ham.addEventListener('click', () => {
    const isOpen = !mobileMenu.hidden;
    mobileMenu.hidden = isOpen;
    ham.classList.toggle('open', !isOpen);
    ham.setAttribute('aria-expanded', String(!isOpen));
  });


  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('panel-' + btn.dataset.target).classList.add('active');
    });
  });


  const apartTabs = document.querySelectorAll('.apart-tab');
  apartTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      apartTabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.apart-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('apart-' + btn.dataset.apart).classList.add('active');
    });
  });



  function buildCarousel({ trackId, prevId, nextId, slidesPerView }) {
    const track = document.getElementById(trackId);
    if (!track) return null;

    const prev = document.getElementById(prevId);
    const next = document.getElementById(nextId);
    let index = 0;

    function visibleCount() {
      if (typeof slidesPerView === 'function') return slidesPerView();
      if (slidesPerView) return slidesPerView;
      const w = track.parentElement.offsetWidth;
      if (w < 520) return 1;
      if (w < 900) return 2;
      return 3;
    }

    function cardWidth() {
      return track.children[0]?.offsetWidth ?? 0;
    }

    function gap() {
      const g = parseFloat(getComputedStyle(track).gap) || 20;
      return g;
    }

    function maxIndex() {
      return Math.max(0, track.children.length - visibleCount());
    }

    function go(i) {
      index = Math.max(0, Math.min(i, maxIndex()));
      const offset = index * (cardWidth() + gap());
      track.style.transform = `translateX(-${offset}px)`;
      track.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';

      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index >= maxIndex();

      return index;
    }

    if (prev) prev.addEventListener('click', () => { go(index - 1); return index; });
    if (next) next.addEventListener('click', () => { go(index + 1); return index; });

    let dragStartX = null;
    let dragStartTranslate = 0;

    function onPointerDown(x) {
      dragStartX = x;
      dragStartTranslate = index * (cardWidth() + gap());
      track.style.transition = 'none';
    }
    function onPointerMove(x) {
      if (dragStartX === null) return;
      const delta = dragStartX - x;
      track.style.transform = `translateX(-${dragStartTranslate + delta}px)`;
    }
    function onPointerUp(x) {
      if (dragStartX === null) return;
      const delta = x - dragStartX;
      dragStartX = null;
      if (Math.abs(delta) > 50) {
        delta < 0 ? go(index + 1) : go(index - 1);
      } else {
        go(index); 
      }
    }

    track.addEventListener('mousedown',  e => { e.preventDefault(); onPointerDown(e.clientX); });
    window.addEventListener('mousemove', e => onPointerMove(e.clientX));
    window.addEventListener('mouseup',   e => onPointerUp(e.clientX));

    track.addEventListener('touchstart', e => onPointerDown(e.touches[0].clientX), { passive: true });
    track.addEventListener('touchmove',  e => onPointerMove(e.touches[0].clientX), { passive: true });
    track.addEventListener('touchend',   e => onPointerUp(e.changedTouches[0].clientX));

    window.addEventListener('resize', () => go(Math.min(index, maxIndex())));

    go(0);

    return {
      go,
      getIndex: () => index,
      getMax: () => maxIndex(),
      next: () => go(index + 1),
      prev: () => go(index - 1),
    };
  }


  buildCarousel({
    trackId: 'ucTrack',
    prevId: 'ucPrev',
    nextId: 'ucNext',
  });


  const testCtrl = buildCarousel({
    trackId: 'testTrack',
    prevId: 'testPrev',
    nextId: 'testNext',
    slidesPerView: 1,
  });

  const dotsContainer = document.getElementById('testDots');
  const testCards = document.querySelectorAll('.test-card');

  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    testCards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => {
        testCtrl.go(i);
        updateDots(i);
      });
      dotsContainer.appendChild(dot);
    });
  }

  function updateDots(activeIndex) {
    dotsContainer?.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
    });
  }

  if (testCtrl) {
    document.getElementById('testPrev')?.addEventListener('click', () => {
      updateDots(testCtrl.getIndex());
    });
    document.getElementById('testNext')?.addEventListener('click', () => {
      updateDots(testCtrl.getIndex());
    });

    buildDots();

    let autoPlay = setInterval(() => {
      if (testCtrl.getIndex() >= testCtrl.getMax()) {
        testCtrl.go(0);
      } else {
        testCtrl.next();
      }
      updateDots(testCtrl.getIndex());
    }, 5000);

    const testCarousel = document.querySelector('.test-carousel');
    testCarousel?.addEventListener('mouseenter', () => clearInterval(autoPlay));
    testCarousel?.addEventListener('mouseleave', () => {
      autoPlay = setInterval(() => {
        if (testCtrl.getIndex() >= testCtrl.getMax()) {
          testCtrl.go(0);
        } else {
          testCtrl.next();
        }
        updateDots(testCtrl.getIndex());
      }, 5000);
    });
  }

});

