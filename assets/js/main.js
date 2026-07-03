(function () {
  const data = window.KRYSTAL_BROWS_DATA;
  if (!data) return;

  const page = document.body.dataset.page || "home";
  const bookingUrl = data.bookingUrl;

  function renderHomeLoader() {
    if (page !== "home") return;

    const loader = document.querySelector("[data-page-loader]");
    const loaderText = document.querySelector("[data-loader-text]");
    if (!loader) return;

    const title = data.brand.name;
    const duration = 3500;
    const typingDuration = 2400;
    const startTime = window.performance.now();

    if (loaderText) {
      loaderText.textContent = "";

      const typeFrame = (now) => {
        const progress = Math.min((now - startTime) / typingDuration, 1);
        const nextLength = Math.max(1, Math.round(progress * title.length));
        loaderText.textContent = title.slice(0, nextLength);

        if (progress < 1) {
          window.requestAnimationFrame(typeFrame);
        }
      };

      window.requestAnimationFrame(typeFrame);
    }

    window.setTimeout(() => {
      loader.classList.add("is-hidden");
      window.setTimeout(() => {
        loader.remove();
      }, 320);
    }, 3500);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach((element) => {
      element.textContent = value;
    });
  }

  function setRichText(selector, value) {
    document.querySelectorAll(selector).forEach((element) => {
      if (Array.isArray(value)) {
        element.innerHTML = value.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
        return;
      }

      element.innerHTML = `<p>${escapeHtml(value)}</p>`;
    });
  }

  function renderMapLink(address) {
    const query = encodeURIComponent(address);
    return `
      <a class="address-link" href="https://www.google.com/maps/search/?api=1&query=${query}" target="_blank" rel="noreferrer">${escapeHtml(address)}</a>
    `;
  }

  function renderHeader() {
    const header = document.querySelector("[data-site-header]");
    if (!header) return;

    const nav = data.navigation
      .map((item) => {
        const itemPage = item.href.replace(".html", "").replace("index", "home");
        const current = itemPage === page ? ' aria-current="page"' : "";
        return `<a href="${escapeHtml(item.href)}"${current}>${escapeHtml(item.label)}</a>`;
      })
      .join("");

    header.innerHTML = `
      <a class="site-logo" href="index.html" aria-label="${escapeHtml(data.brand.name)} home">${escapeHtml(data.brand.name)}</a>
      <nav class="site-nav" id="primary-nav" aria-label="Primary navigation">${nav}</nav>
      <a class="button button--primary" data-booking-link href="${escapeHtml(bookingUrl)}">Book Now</a>
      <button class="menu-toggle" type="button" aria-controls="primary-nav" aria-expanded="false">Menu</button>
    `;

    const toggle = header.querySelector(".menu-toggle");
    const navElement = header.querySelector(".site-nav");
    const navLinks = navElement.querySelectorAll("a");

    const setNavState = (isOpen) => {
      navElement.classList.toggle("is-open", isOpen);
      document.body.classList.toggle("nav-open", isOpen);
      navElement.setAttribute("aria-hidden", String(!isOpen));
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.textContent = isOpen ? "Close" : "Menu";
    };

    toggle.addEventListener("click", () => {
      setNavState(!navElement.classList.contains("is-open"));
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (navElement.classList.contains("is-open")) {
          setNavState(false);
        }
      });
    });
  }

  function renderFooter() {
    const footer = document.querySelector("[data-site-footer]");
    if (!footer) return;
    const footerEmail = data.business.email && !String(data.business.email).startsWith("TODO") ? data.business.email : "To be added";
    const currentYear = new Date().getFullYear();

    const links = data.navigation
      .filter((item) => item.href !== "index.html")
      .map((item) => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`)
      .join("");

    footer.innerHTML = `
      <div class="site-footer__brand">
        <p class="site-logo">${escapeHtml(data.brand.name)}</p>
        <p class="site-footer__tagline">${escapeHtml(data.brand.tagline)}</p>
        <div class="button-row site-footer__actions">
          <a class="button button--primary" data-booking-link href="${escapeHtml(bookingUrl)}">Book Now</a>
          <a class="button button--secondary" href="contact.html">Contact</a>
        </div>
      </div>
      <nav class="site-footer__nav" aria-label="Footer navigation">
        <p class="site-footer__label">Explore</p>
        <div class="site-footer__links">${links}</div>
      </nav>
      <address class="site-footer__contact">
        <p class="site-footer__label">Visit</p>
        ${renderMapLink(data.business.address)}
        <span>${escapeHtml(data.business.phone)}</span>
        <span>${escapeHtml(footerEmail)}</span>
      </address>
      <div class="site-footer__meta">
        <span>Jurupa Valley, California</span>
        <span>© ${currentYear} ${escapeHtml(data.brand.name)}</span>
      </div>
    `;
  }

  function serviceCard(service) {
    const details = [
      ["Price", service.price],
      ["Length", service.length],
      ["Deposit", service.deposit],
      ["Best for", service.bestFor],
      ["Maintenance", service.maintenance]
    ];

    return `
      <article class="service-card">
        <div class="service-card__summary">
          <p class="eyebrow">Signature Service</p>
          <figure class="service-card__media">
            <img src="${escapeHtml(service.image)}" alt="${escapeHtml(service.name)} service visual">
          </figure>
          <h3 class="service-card__title">${escapeHtml(service.name)}</h3>
          <p class="service-card__description">${escapeHtml(service.description)}</p>
        </div>
        <dl class="service-card__details">
          ${details
            .map(([label, value]) => `<div class="service-card__detail service-card__detail--${label.toLowerCase().replaceAll(" ", "-")}"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
            .join("")}
        </dl>
        <a class="button button--primary" data-booking-link href="${escapeHtml(bookingUrl)}">Book Now</a>
      </article>
    `;
  }

  function renderServices() {
    const preview = document.querySelector("[data-services-preview]");
    if (preview) preview.innerHTML = data.services.slice(0, 3).map(serviceCard).join("");

    const list = document.querySelector("[data-services-list]");
    if (list) list.innerHTML = data.services.map(serviceCard).join("");
  }

  function renderTestimonials() {
    const containers = document.querySelectorAll("[data-testimonials]");
    containers.forEach((container) => {
      if (!data.testimonials.length) return;

      container.innerHTML = `
        <figure class="testimonial-card testimonial-card--active" aria-live="polite">
          <blockquote></blockquote>
          <figcaption>
            <span></span>
            <small></small>
          </figcaption>
        </figure>
      `;

      const card = container.querySelector(".testimonial-card");
      const quote = card.querySelector("blockquote");
      const name = card.querySelector("figcaption span");
      const service = card.querySelector("figcaption small");

      let currentIndex = 0;

      const renderCurrent = () => {
        const testimonial = data.testimonials[currentIndex];
        quote.textContent = testimonial.quote;
        name.textContent = testimonial.name;
        service.textContent = testimonial.service;
      };

      renderCurrent();

      window.setInterval(() => {
        card.classList.remove("testimonial-card--active");
        card.classList.add("testimonial-card--fading");

        window.setTimeout(() => {
          currentIndex = (currentIndex + 1) % data.testimonials.length;
          renderCurrent();
          card.classList.remove("testimonial-card--fading");
          card.classList.add("testimonial-card--active");
        }, 240);
      }, 4500);
    });
  }

  function renderContactInfo() {
    function renderContactLink(label, value) {
      if (!value || String(value).startsWith("TODO")) return null;

      if (label === "Phone") {
        const digits = String(value).replace(/[^0-9+]/g, "");
        return `tel:${escapeHtml(digits)}`;
      }

      if (label === "Email") {
        return `mailto:${escapeHtml(value)}`;
      }

      if ((label === "Instagram" || label === "TikTok") && value && /^https?:\/\//i.test(value)) {
        return escapeHtml(value);
      }

      if (label === "Address") {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
      }

      return null;
    }

    function renderContactItem(label, value) {
      const displayValue = value && !String(value).startsWith("TODO") ? value : "To be added";
      const link = renderContactLink(label, value);
      const externalAttributes = label === "Instagram" || label === "TikTok" || label === "Address" ? ' target="_blank" rel="noreferrer"' : "";

      if (link) {
        return `
          <div class="contact-item${label === "Address" ? " contact-item--address" : ""}">
            <dt><a class="contact-link" href="${link}"${externalAttributes}>${escapeHtml(label)}</a></dt>
          </div>
        `;
      }

      return `
        <div class="contact-item${label === "Hours" ? " contact-item--hours" : ""}">
          <dt>${escapeHtml(label)}</dt>
          <dd><span class="contact-text contact-text--hours">${escapeHtml(displayValue).replaceAll("\n", "<br>")}</span></dd>
        </div>
      `;
    }

    const items = [
      ["Phone", data.business.phone],
      ["Email", data.business.email],
      ["Address", data.business.address],
      ["Instagram", data.business.instagram],
      ["TikTok", data.business.tiktok],
      ["Hours", data.business.hours]
    ];

    document.querySelectorAll("[data-contact-info]").forEach((container) => {
      container.innerHTML = items
        .map(([label, value]) => renderContactItem(label, value))
        .join("");
    });
  }

  function renderFaqs() {
    const container = document.querySelector("[data-faq-list]");
    if (!container) return;

    container.innerHTML = data.faqs
      .map(
        (faq, index) => `
          <article class="faq-item">
            <button class="faq-question" type="button" aria-expanded="false" aria-controls="faq-${index}">
              <span>${escapeHtml(faq.question)}</span>
              <span aria-hidden="true">+</span>
            </button>
            <p class="faq-answer" id="faq-${index}">${escapeHtml(faq.answer)}</p>
          </article>
        `
      )
      .join("");

    container.querySelectorAll(".faq-answer").forEach((answer) => {
      answer.style.maxHeight = "0px";
    });

    container.addEventListener("click", (event) => {
      const button = event.target.closest(".faq-question");
      if (!button) return;

      const item = button.closest(".faq-item");
      const answer = item.querySelector(".faq-answer");
      const isOpen = item.classList.toggle("is-open");

      container.querySelectorAll(".faq-item.is-open").forEach((openItem) => {
        if (openItem === item) return;
        openItem.classList.remove("is-open");
        const openButton = openItem.querySelector(".faq-question");
        const openAnswer = openItem.querySelector(".faq-answer");
        if (openButton) openButton.setAttribute("aria-expanded", "false");
        if (openButton) openButton.querySelector("[aria-hidden='true']").textContent = "+";
        if (openAnswer) openAnswer.style.maxHeight = "0px";
      });

      button.setAttribute("aria-expanded", String(isOpen));
      button.querySelector("[aria-hidden='true']").textContent = isOpen ? "-" : "+";
      if (answer) {
        answer.style.maxHeight = isOpen ? `${answer.scrollHeight}px` : "0px";
      }
    });
  }

  function renderBookingSections() {
    const container = document.querySelector("[data-booking-sections]");
    if (!container) return;

    container.innerHTML = data.bookingSections
      .map((section) => `<article class="info-card"><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.copy)}</p></article>`)
      .join("");
  }

  function renderPolicies() {
    const container = document.querySelector("[data-policy-list]");
    if (!container) return;

    container.innerHTML = data.policies
      .map((policy) => `<article class="policy-section"><h2>${escapeHtml(policy.title)}</h2><p>${escapeHtml(policy.copy)}</p></article>`)
      .join("");
  }

  function hydrateStaticText() {
    setText("[data-brand-eyebrow]", data.brand.eyebrow);
    setText("[data-brand-name]", data.brand.name);
    setText("[data-brand-headline]", data.brand.headline);
    setText("[data-brand-intro]", data.brand.intro);
    setRichText("[data-owner-intro]", data.brand.ownerIntro);
    document.querySelectorAll("[data-business-address]").forEach((element) => {
      element.innerHTML = `
        ${renderMapLink(data.business.address)}
      `;
    });

    document.querySelectorAll("[data-booking-link]").forEach((link) => {
      link.setAttribute("href", bookingUrl);
    });

    document.querySelectorAll("[data-hero-video]").forEach((video) => {
      video.setAttribute("poster", data.heroVideo.poster);
      video.setAttribute("aria-label", data.heroVideo.label);
      const source = video.querySelector("source");
      if (source) source.setAttribute("src", data.heroVideo.src);
      video.load();
    });
  }

  renderHeader();
  renderHomeLoader();
  renderFooter();
  hydrateStaticText();
  renderServices();
  renderTestimonials();
  renderContactInfo();
  renderFaqs();
  renderBookingSections();
  renderPolicies();
})();
