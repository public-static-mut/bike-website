const mainPricingList = document.getElementById('mainPricingList');
const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

const serviceCatalog = [
  {
    group: 'Tune-Ups',
    services: [
      {
        name: 'Basic Tune-Up',
        pricingName: 'Basic Tune-Up',
        helenPriceText: '$50'
      },
      { name: 'Standard Tune-Up', helenPriceText: '$100' }
    ]
  },
  {
    group: 'Flat Repairs',
    services: [
      { name: 'Flat Fix', helenPriceText: '$20' },
      { name: 'Tube and Tire Install', helenPriceText: '$10' }
    ]
  },
  {
    group: 'Brakes',
    services: [
      { name: 'Brake Service', helenPriceText: '$25' },
      { name: 'Brake Adjust', helenPriceText: '$20' },
      { name: 'Brake Bleed', helenPriceText: '$45' }
    ]
  },
  {
    group: 'Wheels',
    services: [
      { name: 'Wheel True', helenPriceText: '$40' },
      { name: 'Hub Adjust', helenPriceText: '$15' }
    ]
  },
  {
    group: 'Shifter & Derailleur',
    services: [
      { name: 'Derailleur Adjust', helenPriceText: '$20' },
      { name: 'Chain Install and Adjust', helenPriceText: '$20' },
      { name: 'Cable Install', helenPriceText: '$20' }
    ]
  },
  {
    group: 'Headsets',
    services: [
      { name: 'Headset Adjust', helenPriceText: '$10' },
      { name: 'Headset Overhaul', helenPriceText: '$25' }
    ]
  }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeServiceName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\+/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function parseHelenBasePrice(priceText) {
  const numbers = String(priceText || '').match(/\d+(?:\.\d+)?/g);
  if (!numbers) return 0;
  const values = numbers.map(Number);
  if (values.length === 1) return values[0];
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.round(average);
}

function deriveBudgetPrice(helenBase) {
  if (!helenBase) return 0;
  return Math.max(10, Math.round((helenBase * 0.62) / 5) * 5);
}

async function loadMainPricing() {
  if (!mainPricingList) return;

  try {
    const response = await fetch('/api/pricing');
    if (!response.ok) throw new Error('Failed to load prices');
    const items = await response.json();

    mainPricingList.innerHTML = '';

    const liveItems = Array.isArray(items) ? items : [];
    const liveByName = new Map(
      liveItems.map((item) => [normalizeServiceName(item.service_name), item])
    );

    const groupSections = serviceCatalog
      .map((group) => {
        const serviceRows = group.services
          .map((service) => {
            const live = liveByName.get(
              normalizeServiceName(service.pricingName || service.name)
            );
            const helenBase = parseHelenBasePrice(service.helenPriceText);
            const inferredPrice = deriveBudgetPrice(helenBase);
            const myPrice = live
              ? Number(live.price) || inferredPrice
              : inferredPrice;

            return `
              <tr>
                <td>
                  <div class="service-name">${escapeHtml(service.name)}</div>
                </td>
                <td class="col-you">${myPrice ? usd.format(myPrice) : '—'}</td>
              </tr>
            `;
          })
          .join('');

        return `
          <tr class="chart-group-row">
            <td colspan="2">${escapeHtml(group.group)}</td>
          </tr>
          ${serviceRows}
        `;
      })
      .join('');

    mainPricingList.innerHTML = `
      <table class="service-chart-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>${groupSections}</tbody>
      </table>
    `;
  } catch (error) {
    mainPricingList.textContent = 'Could not load pricing right now.';
  }
}

loadMainPricing();
