document.addEventListener('DOMContentLoaded', () => {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const sideDrawer = document.getElementById('side-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');

  // Toggle drawer open
  function openDrawer() {
    if (sideDrawer && drawerBackdrop) {
      sideDrawer.classList.add('active');
      drawerBackdrop.classList.add('active');
    }
  }

  // Toggle drawer close
  function closeDrawer() {
    if (sideDrawer && drawerBackdrop) {
      sideDrawer.classList.remove('active');
      drawerBackdrop.classList.remove('active');
    }
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', openDrawer);
  }

  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener('click', closeDrawer);
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', closeDrawer);
  }

  // Navigation Logic for Page 2
  setupStageNavLogic();
  setupSizeSelectionHandler();
  setupMaxLimitCheckboxes();
  setupPriceCalculation();
  setupQuantityCounter();
  setupOrderSummaryLogic();
  setupAddToCartLogic();
  setupCartLogic();

  // Fetch local JSON filler data for Menu page
  if (document.getElementById('signature-bowls-grid')) {
    fetch('js/data.json')
      .then(response => response.json())
      .then(data => {
        renderMenuContent(data);
      })
      .catch(error => {
        console.log('Error loading JSON data:', error);
      });
  }
});

function setupStageNavLogic() {
  const stageBtns = document.querySelectorAll('.stage-btn');
  const stepContents = document.querySelectorAll('.step-content');
  const navBtns = document.querySelectorAll('.nav-btn');

  function showStep(stepId) {
    // Hide all steps
    stepContents.forEach(step => step.classList.remove('active'));
    // Deactivate all nav buttons
    stageBtns.forEach(btn => btn.classList.remove('active'));

    // Show target step
    const targetStep = document.getElementById(stepId);
    if (targetStep) targetStep.classList.add('active');

    // Activate corresponding nav button and scroll to it
    const targetBtn = document.querySelector(`.stage-btn[data-target="${stepId}"]`);
    if (targetBtn) {
      targetBtn.classList.add('active');
      targetBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  // Stage button clicks
  stageBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = btn.getAttribute('data-target');
      showStep(targetId);
    });
  });

  // Prev/Next button clicks
  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      let targetId;
      if (btn.classList.contains('prev-btn')) {
        targetId = btn.getAttribute('data-prev');
      } else if (btn.classList.contains('next-btn')) {
        targetId = btn.getAttribute('data-next');
      }
      if (targetId) {
        showStep(targetId);
        // Also scroll top to see the step header
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.scrollTop = 0;
        }
      }
    });
  });
}

function setupSizeSelectionHandler() {
  const sizeSelect = document.getElementById('size-select');
  if (sizeSelect) {
    sizeSelect.addEventListener('change', (e) => {
      const selectedOption = e.target.options[e.target.selectedIndex];
      const desc = selectedOption.getAttribute('data-desc');

      if (desc) {
        const byoDesc = document.querySelector('.byo-desc');
        if (byoDesc) byoDesc.textContent = desc;
      }
      
      if (typeof updateVeggieUI === 'function') updateVeggieUI();
      if (typeof updateToppingUI === 'function') updateToppingUI();
      calculateTotalPrice();
    });
  }
}

function updateVeggieUI() {
  const sizeSelect = document.getElementById('size-select');
  let sizeValue = '';
  if (sizeSelect && sizeSelect.selectedIndex > 0) {
    sizeValue = sizeSelect.value;
  }
  
  let freeVeggiesCount = 0;
  let limitText = "";
  if (sizeValue === 'small') { freeVeggiesCount = 2; limitText = "(Comes with 2)"; }
  else if (sizeValue === 'regular') { freeVeggiesCount = 3; limitText = "(Comes with 3)"; }
  else if (sizeValue === 'large') { freeVeggiesCount = 4; limitText = "(Comes with 4)"; }

  const limitTextSpan = document.querySelector('.veggie-limit-text');
  if (limitTextSpan) limitTextSpan.textContent = limitText;

  const veggieStep = document.getElementById('step-4');
  if (veggieStep) {
    const veggieCheckboxes = veggieStep.querySelectorAll('input[type="checkbox"]');
    const checkedCount = veggieStep.querySelectorAll('input[type="checkbox"]:checked').length;
    
    veggieCheckboxes.forEach(cb => {
      const span = cb.nextElementSibling;
      if (!span) return;
      
      let baseText = span.getAttribute('data-base-text');
      if (!baseText) {
        baseText = span.textContent.replace(' - $1.30', '');
        span.setAttribute('data-base-text', baseText);
      }

      if (checkedCount >= freeVeggiesCount && !cb.checked && freeVeggiesCount > 0) {
        span.textContent = baseText + ' - $1.30';
      } else {
        span.textContent = baseText;
      }
    });
  }
}

function updateToppingUI() {
  const sizeSelect = document.getElementById('size-select');
  let sizeValue = '';
  if (sizeSelect && sizeSelect.selectedIndex > 0) {
    sizeValue = sizeSelect.value;
  }
  
  let freeToppingsCount = 0;
  let limitText = "";
  if (sizeValue === 'small') { freeToppingsCount = 1; limitText = "(Comes with 1)"; }
  else if (sizeValue === 'regular') { freeToppingsCount = 2; limitText = "(Comes with 2)"; }
  else if (sizeValue === 'large') { freeToppingsCount = 3; limitText = "(Comes with 3)"; }

  const limitTextSpan = document.querySelector('.topping-limit-text');
  if (limitTextSpan) limitTextSpan.textContent = limitText;

  const toppingStep = document.getElementById('step-5');
  if (toppingStep) {
    const toppingCheckboxes = toppingStep.querySelectorAll('input[type="checkbox"]');
    const checkedCount = toppingStep.querySelectorAll('input[type="checkbox"]:checked').length;
    
    toppingCheckboxes.forEach(cb => {
      const span = cb.nextElementSibling;
      if (!span) return;
      
      let baseText = span.getAttribute('data-base-text');
      if (!baseText) {
        baseText = span.textContent.replace(' - $2.30', '');
        span.setAttribute('data-base-text', baseText);
      }

      if (checkedCount >= freeToppingsCount && !cb.checked && freeToppingsCount > 0) {
        span.textContent = baseText + ' - $2.30';
      } else {
        span.textContent = baseText;
      }
    });
  }
}

function setupMaxLimitCheckboxes() {
  const maxLimitGroups = document.querySelectorAll('.max-limit-group');
  maxLimitGroups.forEach(group => {
    const max = parseInt(group.getAttribute('data-max'), 10) || 2;
    const checkboxes = group.querySelectorAll('input[type="checkbox"]');

    function updateLimitState() {
      const checkedCount = group.querySelectorAll('input[type="checkbox"]:checked').length;
      
      checkboxes.forEach(cb => {
        const label = cb.closest('.checkbox-label');
        if (checkedCount >= max && !cb.checked) {
          cb.disabled = true;
          if (label) label.classList.add('disabled');
        } else {
          cb.disabled = false;
          if (label) label.classList.remove('disabled');
        }
      });
    }

    checkboxes.forEach(cb => {
      cb.addEventListener('change', updateLimitState);
    });
  });
}

function setupPriceCalculation() {
  const proteinStep = document.getElementById('step-3');
  if (proteinStep) {
    const proteinCheckboxes = proteinStep.querySelectorAll('input[type="checkbox"]');
    proteinCheckboxes.forEach(cb => {
      cb.addEventListener('change', calculateTotalPrice);
    });
  }

  const veggieStep = document.getElementById('step-4');
  if (veggieStep) {
    const veggieCheckboxes = veggieStep.querySelectorAll('input[type="checkbox"]');
    veggieCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        updateVeggieUI();
        calculateTotalPrice();
      });
    });
  }

  const toppingStep = document.getElementById('step-5');
  if (toppingStep) {
    const toppingCheckboxes = toppingStep.querySelectorAll('input[type="checkbox"]');
    toppingCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        updateToppingUI();
        calculateTotalPrice();
      });
    });
  }

  updateVeggieUI();
  updateToppingUI();
  calculateTotalPrice();
}

function calculateTotalPrice() {
  const sizeSelect = document.getElementById('size-select');
  let basePrice = 8.99;
  let sizeValue = '';

  if (sizeSelect && sizeSelect.selectedIndex > 0) {
    const selectedOption = sizeSelect.options[sizeSelect.selectedIndex];
    sizeValue = sizeSelect.value;
    const priceAttr = selectedOption.getAttribute('data-price');
    if (priceAttr) {
      basePrice = parseFloat(priceAttr.replace('$', '')) || 8.99;
    }
  }

  let proteinExtra = 0;
  const checkedProteins = document.querySelectorAll('#step-3 input[type="checkbox"]:checked');
  checkedProteins.forEach(cb => {
    const extraAttr = cb.getAttribute('data-extra');
    if (extraAttr) {
      proteinExtra += parseFloat(extraAttr) || 0;
    }
  });

  let veggieExtra = 0;
  const checkedVeggies = document.querySelectorAll('#step-4 input[type="checkbox"]:checked');
  let freeVeggiesCount = 0;
  if (sizeValue === 'small') freeVeggiesCount = 2;
  else if (sizeValue === 'regular') freeVeggiesCount = 3;
  else if (sizeValue === 'large') freeVeggiesCount = 4;

  if (checkedVeggies.length > freeVeggiesCount) {
    veggieExtra = (checkedVeggies.length - freeVeggiesCount) * 1.30;
  }

  let toppingExtra = 0;
  const checkedToppings = document.querySelectorAll('#step-5 input[type="checkbox"]:checked');
  let freeToppingsCount = 0;
  if (sizeValue === 'small') freeToppingsCount = 1;
  else if (sizeValue === 'regular') freeToppingsCount = 2;
  else if (sizeValue === 'large') freeToppingsCount = 3;

  if (checkedToppings.length > freeToppingsCount) {
    toppingExtra = (checkedToppings.length - freeToppingsCount) * 2.30;
  }

  const qtyNum = document.querySelector('.qty-num');
  let quantity = 1;
  if (qtyNum) {
    quantity = parseInt(qtyNum.textContent, 10) || 1;
  }

  const total = (basePrice + proteinExtra + veggieExtra + toppingExtra) * quantity;
  const orderPrice = document.querySelector('.order-price');
  if (orderPrice) {
    orderPrice.textContent = `$${total.toFixed(2)}`;
  }
}

function setupQuantityCounter() {
  const minusBtn = document.querySelector('.minus-btn');
  const plusBtn = document.querySelector('.plus-btn');
  const qtyNum = document.querySelector('.qty-num');

  if (minusBtn && plusBtn && qtyNum) {
    minusBtn.addEventListener('click', () => {
      let qty = parseInt(qtyNum.textContent, 10);
      if (qty > 1) {
        qty--;
        qtyNum.textContent = qty;
        calculateTotalPrice();
      }
    });

    plusBtn.addEventListener('click', () => {
      let qty = parseInt(qtyNum.textContent, 10);
      qty++;
      qtyNum.textContent = qty;
      calculateTotalPrice();
    });
  }
}

function setupOrderSummaryLogic() {
  const seeOrderRow = document.querySelector('.see-order-row');
  const bottomBar = document.querySelector('.byo-bottom-bar');
  const summaryContent = document.querySelector('.order-summary-content');
  
  if (!seeOrderRow || !bottomBar || !summaryContent) return;

  summaryContent.addEventListener('click', (e) => {
    if (e.target.classList.contains('summary-minus-btn')) {
      const mainMinusBtn = document.querySelector('.minus-btn:not(.summary-minus-btn)');
      if (mainMinusBtn) {
        mainMinusBtn.click();
        populateOrderSummary(summaryContent);
      }
      return;
    }
    
    if (e.target.classList.contains('summary-plus-btn')) {
      const mainPlusBtn = document.querySelector('.plus-btn:not(.summary-plus-btn)');
      if (mainPlusBtn) {
        mainPlusBtn.click();
        populateOrderSummary(summaryContent);
      }
      return;
    }

    const item = e.target.closest('.summary-item');
    if (!item || !item.hasAttribute('data-input-name')) return;
    
    const name = item.getAttribute('data-input-name');
    const val = item.getAttribute('data-input-value');
    const originalCb = document.querySelector(`input[name="${name}"][value="${val}"]`);
    
    if (originalCb) {
      originalCb.checked = !originalCb.checked;
      originalCb.dispatchEvent(new Event('change'));

      const box = item.querySelector('.summary-item-box');
      if (originalCb.checked) {
        box.innerHTML = '&#10003;';
        box.classList.add('checked');
        box.classList.remove('unchecked');
        item.classList.remove('deselected');
      } else {
        box.innerHTML = '';
        box.classList.remove('checked');
        box.classList.add('unchecked');
        item.classList.add('deselected');
        
        // Move to bottom of the section
        const section = item.closest('.summary-section');
        section.appendChild(item);
      }
    }
  });

  summaryContent.addEventListener('change', (e) => {
    if (e.target.classList.contains('summary-size-select')) {
      const mainSizeSelect = document.getElementById('size-select');
      if (mainSizeSelect) {
        mainSizeSelect.value = e.target.value;
        mainSizeSelect.dispatchEvent(new Event('change'));
        populateOrderSummary(summaryContent);
      }
    }
  });

  seeOrderRow.addEventListener('click', () => {
    const isExpanded = bottomBar.classList.contains('expanded');
    const textSpan = bottomBar.querySelector('.see-order-btn span:first-child');
    const chevron = bottomBar.querySelector('.chevron-up');
    
    if (isExpanded) {
      bottomBar.classList.remove('expanded');
      if (textSpan) textSpan.textContent = 'See Order';
      if (chevron) chevron.innerHTML = '&#9650;';
    } else {
      bottomBar.classList.add('expanded');
      if (textSpan) textSpan.textContent = 'Order Summary';
      if (chevron) chevron.innerHTML = '&#9660;';
      populateOrderSummary(summaryContent);
    }
  });
}

function populateOrderSummary(container) {
  let html = '';

  // Size
  const sizeSelect = document.getElementById('size-select');
  const sizeValue = sizeSelect ? sizeSelect.value : '';
  const isSmall = sizeValue === 'small' ? 'selected' : '';
  const isRegular = sizeValue === 'regular' ? 'selected' : '';
  const isLarge = sizeValue === 'large' ? 'selected' : '';
  const isNone = (!isSmall && !isRegular && !isLarge) ? 'selected' : '';

  let freeVeggiesCount = 0;
  let freeToppingsCount = 0;
  if (sizeValue === 'small') { freeVeggiesCount = 2; freeToppingsCount = 1; }
  else if (sizeValue === 'regular') { freeVeggiesCount = 3; freeToppingsCount = 2; }
  else if (sizeValue === 'large') { freeVeggiesCount = 4; freeToppingsCount = 3; }

  html += `
    <div class="summary-section">
      <div class="summary-title">Size</div>
      <select class="custom-select summary-size-select" style="margin-top: 4px;">
        <option value="" disabled ${isNone}>Select one</option>
        <option value="small" ${isSmall}>Small bowl - $8.99</option>
        <option value="regular" ${isRegular}>Regular bowl - $10.99</option>
        <option value="large" ${isLarge}>Large bowl - $13.29</option>
      </select>
    </div>
  `;

  // Helper to generate sections
  const generateSection = (title, nameAttr) => {
    const checked = document.querySelectorAll(`input[name="${nameAttr}"]:checked`);
    let sectionHtml = `<div class="summary-section"><div class="summary-title">${title}</div>`;
    
    if (checked.length === 0) {
      sectionHtml += `<div class="summary-item empty-text">None selected</div>`;
    } else {
      checked.forEach((cb, index) => {
        let labelText = cb.value;
        if (cb.nextElementSibling) {
          labelText = cb.nextElementSibling.getAttribute('data-base-text') || cb.nextElementSibling.textContent.replace(/ - \$\d+\.\d+/, '');
        }

        if (nameAttr === 'veggies' && index >= freeVeggiesCount) {
          labelText += ' <span style="color: #666; font-size: 0.9em;">(+ $1.30)</span>';
        } else if (nameAttr === 'toppings' && index >= freeToppingsCount) {
          labelText += ' <span style="color: #666; font-size: 0.9em;">(+ $2.30)</span>';
        } else if (nameAttr === 'protein') {
          const extraPrice = cb.getAttribute('data-extra');
          if (extraPrice) {
            labelText += ` <span style="color: #666; font-size: 0.9em;">(+ $${parseFloat(extraPrice).toFixed(2)})</span>`;
          }
        }

        sectionHtml += `
          <div class="summary-item" data-input-name="${nameAttr}" data-input-value="${cb.value}" style="cursor: pointer;">
            <div class="summary-item-box checked">&#10003;</div>
            <span>${labelText}</span>
          </div>
        `;
      });
    }
    sectionHtml += `</div>`;
    return sectionHtml;
  };

  html += generateSection('Base', 'base');
  html += generateSection('Proteins', 'protein');
  html += generateSection('Veggies', 'veggies');
  html += generateSection('Toppings', 'toppings');
  html += generateSection('Sauces', 'sauces');
  html += generateSection('Garnishes', 'garnishes');

  const qtyNum = document.querySelector('.qty-num');
  const currentQty = qtyNum ? parseInt(qtyNum.textContent, 10) || 1 : 1;

  html += `
    <div class="summary-section">
      <div class="summary-title">Quantity</div>
      <div class="summary-item qty-counter" style="margin-top: 0; justify-content: flex-start; padding: 0;">
        <button type="button" class="qty-btn summary-minus-btn" aria-label="Decrease quantity">-</button>
        <span class="qty-num summary-qty-num">${currentQty}</span>
        <button type="button" class="qty-btn summary-plus-btn" aria-label="Increase quantity">+</button>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function setupAddToCartLogic() {
  const addToCartBtn = document.querySelector('.add-to-cart-btn');
  if (addToCartBtn && document.getElementById('size-select')) {
    addToCartBtn.addEventListener('click', (e) => {
      const sizeSelect = document.getElementById('size-select');
      const basesChecked = document.querySelectorAll(`input[name="base"]:checked`);
      
      if (!sizeSelect || sizeSelect.value === "" || basesChecked.length === 0) {
        e.preventDefault();
        alert('Please select a size and at least one base before adding to cart.');
        return;
      }

      const sizeText = sizeSelect && sizeSelect.options[sizeSelect.selectedIndex] && !sizeSelect.options[sizeSelect.selectedIndex].disabled 
        ? sizeSelect.options[sizeSelect.selectedIndex].text.split(' - ')[0] 
        : 'Custom Bowl';
        
      const getCheckedNames = (name) => Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
        .map(el => el.nextElementSibling.textContent.split(' - ')[0].trim());

      const bases = getCheckedNames('base');
      const proteins = getCheckedNames('protein');
      const veggies = getCheckedNames('veggies');
      const toppings = getCheckedNames('toppings');
      const sauces = getCheckedNames('sauces');
      const garnishes = getCheckedNames('garnishes');

      const allItems = [...bases, ...proteins, ...veggies, ...toppings, ...sauces, ...garnishes];
      let desc = allItems.join(', ');
      
      const qtyNum = document.querySelector('.qty-num:not(.summary-qty-num)');
      const quantity = qtyNum ? parseInt(qtyNum.textContent, 10) || 1 : 1;

      const priceText = document.querySelector('.order-price').textContent.replace('$', '');
      const unitPrice = (parseFloat(priceText) / quantity).toFixed(2);

      const cartItem = {
        title: sizeText,
        desc: desc || 'Build Your Own Bowl',
        price: unitPrice,
        quantity: quantity
      };

      sessionStorage.setItem('cartItem', JSON.stringify(cartItem));
      window.location.href = 'cart.html?added=1';
    });
  }
}

function renderMenuContent(data) {
  // Populate BYO Section text, price & image if available on index.html
  const byoCard = document.querySelector('.byo-card');
  if (byoCard && data.byo) {
    byoCard.innerHTML = `
      ${data.byo.image ? 
        `<div class="bowl-img-wrapper"><img src="${data.byo.image}" alt="${data.byo.title}" class="bowl-img" onerror="this.parentElement.outerHTML='<div class=&quot;placeholder-box&quot;></div>'"></div>` : 
        `<div class="placeholder-box" aria-label="${data.byo.title} Placeholder"></div>`
      }
      ${data.byo.price ? `<div class="bowl-price">${data.byo.price}</div>` : ''}
      <p id="byo-text" class="lorem-text">${data.byo.description}</p>
    `;
  }

  // Populate Signature Bowls Grid
  const bowlsGrid = document.getElementById('signature-bowls-grid');
  if (bowlsGrid && data.signatureBowls) {
    bowlsGrid.innerHTML = data.signatureBowls.map(bowl => `
      <div class="bowl-card">
        ${bowl.image ? 
          `<div class="bowl-img-wrapper"><img src="${bowl.image}" alt="${bowl.name}" class="bowl-img" onerror="this.parentElement.outerHTML='<div class=&quot;placeholder-box&quot;></div>'"></div>` : 
          `<div class="placeholder-box" aria-label="${bowl.name || 'Signature Bowl'} Placeholder"></div>`
        }
        <h3 class="bowl-name">${bowl.name || 'Signature Bowl'}</h3>
        ${bowl.price ? `<div class="bowl-price">${bowl.price}</div>` : ''}
        <p class="lorem-text">${bowl.description}</p>
      </div>
    `).join('');
  }
}

function setupCartLogic() {
  const cartContent = document.querySelector('.cart-content');
  if (!cartContent) return;

  const subtotalEl = document.getElementById('cart-subtotal');
  const hstEl = document.getElementById('cart-hst');
  const tipEl = document.getElementById('cart-tip');
  const totalEl = document.getElementById('cart-total');
  const minusBtn = document.querySelector('.cart-minus-btn');
  const plusBtn = document.querySelector('.cart-plus-btn');
  const qtyNum = document.querySelector('.cart-qty-num');
  const trashBtn = document.querySelector('.trash-btn');
  const cartItem = document.getElementById('cart-item-1');
  const tipBtns = document.querySelectorAll('.tip-btn');
  
  let currentTipPercent = 15;
  
  let cartData = null;
  const saved = sessionStorage.getItem('cartItem');
  if (saved) {
    cartData = JSON.parse(saved);
  }

  let quantity = cartData ? cartData.quantity : 0;
  let basePrice = cartData ? parseFloat(cartData.price) : 0;

  if (cartData) {
    const titleEl = document.querySelector('.cart-item-title');
    const descEl = document.querySelector('.cart-item-desc');
    const priceEl = document.querySelector('.cart-item-price');
    const qtyNumEl = document.querySelector('.cart-qty-num');
    
    if (titleEl) titleEl.textContent = cartData.title;
    if (descEl) descEl.textContent = cartData.desc;
    if (priceEl) priceEl.textContent = `$${basePrice.toFixed(2)}`;
    if (qtyNumEl) qtyNumEl.textContent = quantity;
  }

  const emptyState = document.getElementById('empty-cart-state');
  const fullState = document.getElementById('full-cart-state');
  const bottomBar = document.getElementById('cart-bottom-bar');
  const cartCount = document.querySelector('.cart-count');

  function toggleCartDisplay() {
    if (quantity === 0) {
      if (emptyState) emptyState.style.display = 'block';
      if (fullState) fullState.style.display = 'none';
      if (bottomBar) bottomBar.style.display = 'none';
      if (cartCount) cartCount.textContent = '0 items';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      if (fullState) fullState.style.display = 'block';
      if (bottomBar) bottomBar.style.display = 'block';
    }
  }

  function updateCartMath() {
    if (quantity === 0) {
      sessionStorage.removeItem('cartItem');
      toggleCartDisplay();
      return;
    }
    
    if (cartData) {
      cartData.quantity = quantity;
      sessionStorage.setItem('cartItem', JSON.stringify(cartData));
    }

    const subtotal = basePrice * quantity;
    const hst = subtotal * 0.13;
    const tip = subtotal * (currentTipPercent / 100);
    const total = subtotal + hst + tip;

    const itemPriceEl = document.querySelector('.cart-item-price');
    if (itemPriceEl) itemPriceEl.textContent = `$${subtotal.toFixed(2)}`;

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    hstEl.textContent = `$${hst.toFixed(2)}`;
    tipEl.textContent = `$${tip.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;

    if (cartCount) cartCount.textContent = `${quantity} item${quantity !== 1 ? 's' : ''}`;
  }

  toggleCartDisplay();

  if (minusBtn && plusBtn && qtyNum) {
    minusBtn.addEventListener('click', () => {
      if (quantity > 1) {
        quantity--;
        qtyNum.textContent = quantity;
        updateCartMath();
      }
    });

    plusBtn.addEventListener('click', () => {
      quantity++;
      qtyNum.textContent = quantity;
      updateCartMath();
    });
  }

  if (trashBtn && cartItem) {
    trashBtn.addEventListener('click', () => {
      cartItem.style.display = 'none';
      quantity = 0;
      updateCartMath();
    });
  }

  tipBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tipVal = e.target.getAttribute('data-tip');
      
      if (tipVal === 'other') {
        const userInput = prompt("Enter custom tip percentage (e.g., 20):");
        if (userInput !== null && !isNaN(userInput) && userInput.trim() !== '') {
          currentTipPercent = parseFloat(userInput);
          tipBtns.forEach(b => b.classList.remove('selected'));
          e.target.classList.add('selected');
          e.target.textContent = `${currentTipPercent}%`;
        } else {
          return;
        }
      } else {
        tipBtns.forEach(b => b.classList.remove('selected'));
        e.target.classList.add('selected');
        currentTipPercent = parseInt(tipVal, 10);
        
        const otherBtn = document.querySelector('.tip-btn[data-tip="other"]');
        if (otherBtn) otherBtn.textContent = 'Other';
      }
      
      updateCartMath();
    });
  });

  updateCartMath();
}
