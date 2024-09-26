const REQUEST_URL =
  'https://veryfast.io/t/front_test_api.php';

window.addEventListener('DOMContentLoaded', fetchPlans);

async function fetchPlans() {
  try {
    const response = await fetch(REQUEST_URL);
    if (!response.ok)
      throw new Error(
        `HTTP error! status: ${response.status}`,
      );

    const data = await response.json();
    if (!data.result?.elements)
      throw new Error('Invalid data structure');

    renderPlans(data.result.elements);
  } catch (error) {
    console.error('Error while fetching plans:', error);
  }
}

function renderPlans(plans) {
  if (!Array.isArray(plans) || !plans.length) {
    console.warn('No plans available to render.');
    return;
  }

  const plansWrapper = document.querySelector(
    '.product__wrapper',
  );
  if (!plansWrapper) {
    console.error(
      'Element with class ".product__wrapper" not found.',
    );
    return;
  }

  plansWrapper.innerHTML = '';
  plansWrapper.append(...plans.map(createPlanElement));
  addDownloadEventListeners(plans);
}

function createPlanElement(plan) {
  const element = document.createElement('div');
  element.className = 'product__card item-card';

  const [nameProd] = plan.name_display.split(
    /(?<=McAfee\u00ae Total Protection)\s+/,
  );
  const isDiscountBadge = plan.price_key === '50%';

  element.innerHTML = `
    <div class="item-card__header${
      isDiscountBadge ? ' item-card__header--discount' : ''
    }">
      ${
        plan.is_best
          ? '<span class="item-card__header-best">Best value</span>'
          : ''
      }
      <p class="item-card__price">$${
        plan.amount
      }<span class="item-card__period">${
    isDiscountBadge ? '/MO' : '/per year'
  }</span>
  <span class="item-card__discount">${
    isDiscountBadge ? '$9.99' : ''
  }</span>
  </p>
    </div>
    <div class="item-card__body">
      <p class="item-card__description">${nameProd}<b>${
    plan.license_name
  }</b></p>
      <button class="item-card__button button-gradient" data-url="${
        plan.url
      }">Download</button>
    </div>
  `;

  return element;
}

function addDownloadEventListeners(plans) {
  document
    .querySelectorAll('.item-card__button')
    .forEach((button, index) => {
      button.addEventListener('click', () =>
        onDownload(plans[index].link),
      );
    });
}

function onDownload(url) {
  const a = document.createElement('a');
  a.href = url;
  a.download = url.split('/').pop();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  const downloadIndicator = document.querySelector(
    '.download-indicator',
  );
  downloadIndicator.querySelector(
    '.indicator__top',
  ).style.display = 'none';
  downloadIndicator.querySelector(
    '.indicator__bottom',
  ).style.display = 'none';

  const currentBrowser = detectBrowser();

  downloadIndicator.style.opacity = '0';
  downloadIndicator.style.display = 'flex';

  const styleConfig = {
    Chrome: {
      bottom: '100px',
      left: '20px',
      displayTop: 'none',
      displayBottom: 'block',
    },
    Firefox: {
      top: '100px',
      right: '20px',
      displayTop: 'block',
      displayBottom: 'none',
    },
    Edge: {
      bottom: '100px',
      left: '20px',
      displayTop: 'none',
      displayBottom: 'block',
    },
    Unknown: {
      bottom: '100px',
      left: '20px',
      displayTop: 'none',
      displayBottom: 'block',
    },
  }[currentBrowser];

  downloadIndicator.querySelector(
    '.indicator__top',
  ).style.display = styleConfig.displayTop;
  downloadIndicator.querySelector(
    '.indicator__bottom',
  ).style.display = styleConfig.displayBottom;
  downloadIndicator.style.left = styleConfig.left || '';
  downloadIndicator.style.bottom = styleConfig.bottom || '';
  downloadIndicator.style.top = styleConfig.top || '';

  setTimeout(() => {
    downloadIndicator.style.transition = 'opacity 0.5s';
    downloadIndicator.style.opacity = '1';
  }, 1500);
}

function detectBrowser() {
  const userAgent = navigator.userAgent;

  if (userAgent.includes('Chrome')) return 'Chrome';

  if (userAgent.includes('Firefox')) return 'Firefox';

  if (userAgent.includes('Edge')) return 'Edge';

  return 'Unknown';
}
