const counters = document.querySelectorAll('.stat-card h3');
const statsSection = document.querySelector('.stats-section');

let started = false;

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !started) {
      started = true;

      counters.forEach(counter => {
        let target = counter.innerText;
        let num = parseInt(target.replace(/[^0-9]/g, ''));
        let count = 0;

        let interval = setInterval(() => {
          count += Math.ceil(num / 50);

          if (count >= num) {
            counter.innerText = target;
            clearInterval(interval);
          } else {
            counter.innerText = count + (target.includes('+') ? '+' : '');
          }
        }, 20);
      });

      observer.disconnect(); // ensures it runs only once
    }
  });
}, {
  threshold: 0.4 // triggers when 40% visible
});

observer.observe(statsSection);

const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const btn = item.querySelector('.faq-question');

  btn.addEventListener('click', () => {
    // close others (optional - accordion style)
    faqItems.forEach(i => {
      if (i !== item) i.classList.remove('active');
    });

    // toggle current
    item.classList.toggle('active');
  });
});

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.onload = () => {
  window.scrollTo(0, 0);
};

const reveals = document.querySelectorAll('.reveal');

const observer1 = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
});

reveals.forEach(el => observer1.observe(el));