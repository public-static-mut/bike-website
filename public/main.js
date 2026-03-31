const mainPricingList = document.getElementById('mainPricingList');
const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

const serviceCatalog = [
  {
    group: 'Tune-Ups',
    services: [
      { name: 'Single-Speed Tune-Up', helenPriceText: '$65' },
      { name: 'Standard Tune-Up', helenPriceText: '$100' },
      { name: 'The Ultra Tune-Up', helenPriceText: '$160' },
      { name: 'Complete Overhaul', helenPriceText: '$275' }
    ]
  },
  {
    group: 'Bars & Stems',
    services: [
      { name: 'Aero Bar install', helenPriceText: '$30' },
      { name: 'Aero Bar install w/ shifters', helenPriceText: '$70' },
      { name: 'Grips install', helenPriceText: '$10' },
      { name: 'Handlebar install (for higher raised bar)', helenPriceText: '$65' },
      { name: 'Handlebar tape wrapped', helenPriceText: '$15' },
      { name: 'Road Bar install', helenPriceText: '$60' },
      { name: 'Internal routing bar install', helenPriceText: '$100-$200' },
      { name: 'Stem install (closed face)', helenPriceText: '$15-$30' },
      { name: 'Stem Install (open face)', helenPriceText: '$10-$20' }
    ]
  },
  {
    group: 'Brakes',
    services: [
      { name: 'Brake adjust (each)', helenPriceText: '$20' },
      { name: 'Brake bleed (each)', helenPriceText: '$45' },
      { name: 'Hydraulic brake install (each)', helenPriceText: '$50 - $65' },
      { name: 'Brake lever install (pair)', helenPriceText: '$40 – Hydraulics $60' },
      { name: 'Brake pad install (pair)', helenPriceText: '$20' },
      { name: 'Brake road caliper install (each)', helenPriceText: '$25' },
      { name: 'Cable install', helenPriceText: '$20' },
      { name: 'Disc brake caliper rebuild (each)', helenPriceText: '$60' },
      { name: 'Disc brake pad replace (each)', helenPriceText: '$20' }
    ]
  },
  {
    group: 'Wheels',
    services: [
      { name: 'Hub adjust (each)', helenPriceText: '$15' },
      { name: 'Hub overhaul (front and rear)', helenPriceText: '$30-$50' },
      { name: 'Sealant install for tubeless (each)', helenPriceText: '$25' },
      { name: 'Tube and tire install', helenPriceText: '$10' },
      { name: 'Tubular tire install (each)', helenPriceText: '$35' },
      { name: 'Wheel build', helenPriceText: '$80-$110 - $120' },
      { name: 'Wheel true front', helenPriceText: '$25' },
      { name: 'Wheel true rear', helenPriceText: '$30-$60' },
      { name: 'Wheel true with spoke install', helenPriceText: '$40-$60' }
    ]
  },
  {
    group: 'Shifter & Derailleur',
    services: [
      { name: 'Derailleur adjust (each)', helenPriceText: '$20' },
      { name: 'Derailleur cable/housing install', helenPriceText: '$20-$25' },
      { name: 'Front derailleur install and adjust', helenPriceText: '$30-$35' },
      { name: 'Rear derailleur install and adjust', helenPriceText: '$40' },
      { name: 'Electronic shifters install', helenPriceText: '$100' },
      { name: 'Mountain shifters install', helenPriceText: '$40' }
    ]
  },
  {
    group: 'Drivetrains',
    services: [
      { name: 'Bottom bracket adjust', helenPriceText: '$30' },
      { name: 'Bottom bracket remove/replace', helenPriceText: '$40' },
      { name: 'Cassette/freewheel install', helenPriceText: '$15' },
      { name: 'Chain install and adjust', helenPriceText: '$20' },
      { name: 'Chainring install', helenPriceText: '$25' },
      { name: 'Crankset install', helenPriceText: '$450' },
      { name: 'Pedal install', helenPriceText: '$10/set' }
    ]
  },
  {
    group: 'Forks & Headsets',
    services: [
      { name: 'Fork install (standard)', helenPriceText: '$35' },
      { name: 'Fork install (double crown)', helenPriceText: '$45' },
      { name: 'Fork overhaul (suspension)', helenPriceText: '$80-$120' },
      { name: 'Headset adjust', helenPriceText: '$10' },
      { name: 'Headset overhaul/install', helenPriceText: '$25-$35' }
    ]
  },
  {
    group: 'Pro Bike Builds',
    services: [
      { name: 'Pro Build (New Purchase)', helenPriceText: '$200' },
      {
        name: 'Pro Build (Frame-up, used and outside purchase)',
        helenPriceText: '$350'
      },
      {
        name: 'Pro Build w/ electronic shifting (frame up)',
        helenPriceText: 'Add $50'
      },
      {
        name: 'Pro Build with Hydraulic Disc Brakes',
        helenPriceText: 'Add $50'
      },
      { name: 'Boxed bike assembly with tune-up (road)', helenPriceText: '$130' },
      {
        name: 'Boxed bike assembly with tune-up (MTB or TT bike)',
        helenPriceText: '$150'
      },
      { name: 'Boxed bike assembly with tune-up (electric)', helenPriceText: '$250' }
    ]
  },
  {
    group: 'Warranty Repair/Replacement',
    services: [
      {
        name: 'Warranty repair/replacement (outside purchase)',
        helenPriceText: '$60 + labor'
      }
    ]
  },
  {
    group: 'Other Services',
    services: [
      { name: 'Box bike for shipping', helenPriceText: '$135' },
      { name: 'Box Mtn/Tri bike for shipping', helenPriceText: '$150' },
      { name: 'Box electric bike for shipping', helenPriceText: '$225' },
      { name: 'Box frame for shipping', helenPriceText: '$60' },
      { name: 'Daily storage fee', helenPriceText: '$5' },
      { name: 'Suspension pivot and parts overhaul', helenPriceText: '$60-$120' },
      { name: 'Power meter crankset install', helenPriceText: '$60' },
      { name: 'Electric Bike/Component Software Update', helenPriceText: '$50' },
      { name: 'Basket Install', helenPriceText: '$15' },
      { name: 'Baby Seat w/ Rack Install', helenPriceText: '$30' },
      { name: 'Bottom Bracket Face/Tap', helenPriceText: '$40' },
      { name: 'Bottom Bracket Remove/Replace', helenPriceText: '$40' },
      { name: 'Cleat Install', helenPriceText: '$15' },
      { name: 'Fender Install', helenPriceText: '$30' }
    ]
  },
  {
    group: 'Electric Bike Service',
    services: [
      { name: 'E-Bike Tune Up', helenPriceText: '$165' },
      { name: 'Assemble Used E-Bike & Tune-Up', helenPriceText: '$200' },
      { name: 'Box E-Bike For Shipping', helenPriceText: '$180 (plus extra for battery)' },
      { name: 'E-Bike Tube/Tire Install (Wheel on Bike)', helenPriceText: '$30' },
      {
        name: 'E-Bike Electronic Component Software Update',
        helenPriceText: '$50'
      }
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
            const live = liveByName.get(normalizeServiceName(service.name));
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

    const catalogNames = new Set(
      serviceCatalog.flatMap((group) =>
        group.services.map((service) => normalizeServiceName(service.name))
      )
    );

    const additionalRows = liveItems
      .filter((item) => !catalogNames.has(normalizeServiceName(item.service_name)))
      .map((item) => {
        const myPrice = Number(item.price) || 0;
        return `
          <tr>
            <td>
              <div class="service-name">${escapeHtml(item.service_name)}</div>
            </td>
            <td class="col-you">${usd.format(myPrice)}</td>
          </tr>
        `;
      })
      .join('');

    const additionalSection = additionalRows
      ? `
        <tr class="chart-group-row">
          <td colspan="2">Additional Services</td>
        </tr>
        ${additionalRows}
      `
      : '';

    mainPricingList.innerHTML = `
      <table class="service-chart-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>${groupSections}${additionalSection}</tbody>
      </table>
    `;
  } catch (error) {
    mainPricingList.textContent = 'Could not load pricing right now.';
  }
}

loadMainPricing();
