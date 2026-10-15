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

  // Accordion & BYO Logic for Page 2
  setupAccordionLogic();
  setupSizeSelectionHandler();
  setupMaxLimitCheckboxes();
  setupItemQuantitySteppers();
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

function setupAccordionLogic() {
  const accordionSteps = document.querySelectorAll('.accordion-step');
  const stageTabs = document.querySelectorAll('.stage-tab');
  const scrollbar = document.querySelector('.stages-scrollbar');

  function updateActiveStage(stepId) {
    stageTabs.forEach(tab => {
      if (tab.getAttribute('data-step-target') === stepId) {
        tab.classList.add('active');
        // Scroll tab smoothly into view inside the horizontal scrollbar
        tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } else {
        tab.classList.remove('active');
      }
    });
  }

  function goToStep(targetStep) {
    if (!targetStep) return;

    // Collapse all steps
    accordionSteps.forEach(s => {
      s.classList.remove('open');
      const c = s.querySelector('.chevron-icon');
      if (c) c.innerHTML = '&#9660;';
    });

    // Open target step
    targetStep.classList.add('open');
    const chevron = targetStep.querySelector('.chevron-icon');
    if (chevron) chevron.innerHTML = '&#9650;';

    // Update active tab in horizontal scrollbar
    updateActiveStage(targetStep.id);

    // Scroll step into view smoothly
    targetStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Handle stage tab clicks
  stageTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-step-target');
      const targetStep = document.getElementById(targetId);
      if (targetStep) {
        goToStep(targetStep);
      }
    });
  });

  accordionSteps.forEach((step) => {
    const header = step.querySelector('.accordion-header');
    const nextBtn = step.querySelector('.next-btn') || step.querySelector('.done-btn');
    const prevBtn = step.querySelector('.prev-btn');

    // Header click in stage mode ensures step remains active
    if (header) {
      header.addEventListener('click', () => {
        if (!step.classList.contains('open')) {
          goToStep(step);
        }
      });
    }

    // Next / Done button click: open next step
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextStep = step.nextElementSibling;
        if (nextStep && nextStep.classList.contains('accordion-step')) {
          goToStep(nextStep);
        }
      });
    }

    // Prev button click: open previous step
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const prevStep = step.previousElementSibling;
        if (prevStep && prevStep.classList.contains('accordion-step')) {
          goToStep(prevStep);
        }
      });
    }
  });
}

function getItemQty(cb) {
  const row = cb.closest('.option-row');
  if (row) {
    const countEl = row.querySelector('.item-qty-count');
    if (countEl) {
      return parseInt(countEl.textContent, 10) || 1;
    }
  }
  return 1;
}

function setupItemQuantitySteppers() {
  const optionRows = document.querySelectorAll('.option-row');
  optionRows.forEach(row => {
    const cb = row.querySelector('input[type="checkbox"]');
    const stepper = row.querySelector('.item-qty-stepper');
    const minusBtn = row.querySelector('.item-minus');
    const plusBtn = row.querySelector('.item-plus');
    const countEl = row.querySelector('.item-qty-count');

    if (cb && stepper) {
      cb.addEventListener('change', () => {
        if (cb.checked) {
          stepper.classList.add('active');
          if (countEl) countEl.textContent = '1';
          registerPortionAdd(cb.name, cb.value);
        } else {
          stepper.classList.remove('active');
          if (countEl) countEl.textContent = '1';
          // Remove all remaining portions for this unchecked item
          if (cb.name === 'veggies') {
            veggiePortionHistory = veggiePortionHistory.filter(v => v !== cb.value);
          } else if (cb.name === 'toppings') {
            toppingPortionHistory = toppingPortionHistory.filter(v => v !== cb.value);
          }
        }
        if (typeof updateProteinUI === 'function') updateProteinUI();
        if (typeof updateVeggieUI === 'function') updateVeggieUI();
        if (typeof updateToppingUI === 'function') updateToppingUI();
        calculateTotalPrice();
      });
    }

    if (minusBtn && countEl && cb) {
      minusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        registerPortionRemove(cb.name, cb.value);
        let count = parseInt(countEl.textContent, 10) || 1;
        if (count > 1) {
          count--;
          countEl.textContent = count;
        } else {
          // decrementing 1 unchecks the item
          cb.checked = false;
          stepper.classList.remove('active');
          countEl.textContent = '1';
        }
        if (typeof updateProteinUI === 'function') updateProteinUI();
        if (typeof updateVeggieUI === 'function') updateVeggieUI();
        if (typeof updateToppingUI === 'function') updateToppingUI();
        calculateTotalPrice();
      });
    }

    if (plusBtn && countEl && cb) {
      plusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        let count = parseInt(countEl.textContent, 10) || 1;
        count++;
        countEl.textContent = count;
        registerPortionAdd(cb.name, cb.value);
        if (typeof updateProteinUI === 'function') updateProteinUI();
        if (typeof updateVeggieUI === 'function') updateVeggieUI();
        if (typeof updateToppingUI === 'function') updateToppingUI();
        calculateTotalPrice();
      });
    }
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
      
      if (typeof updateProteinUI === 'function') updateProteinUI();
      if (typeof updateVeggieUI === 'function') updateVeggieUI();
      if (typeof updateToppingUI === 'function') updateToppingUI();
      calculateTotalPrice();
    });
  }
}

function updateProteinUI() {
  const proteinStep = document.getElementById('step-3');
  if (proteinStep) {
    const proteinCheckboxes = proteinStep.querySelectorAll('input[type="checkbox"]');
    proteinCheckboxes.forEach(cb => {
      const span = cb.nextElementSibling;
      if (!span) return;
      
      let baseName = span.getAttribute('data-base-name');
      if (!baseName) {
        baseName = span.textContent.split(' - ')[0].trim();
        span.setAttribute('data-base-name', baseName);
      }

      const unitExtra = parseFloat(cb.getAttribute('data-extra')) || 0;
      const unitExtraStr = `$${unitExtra.toFixed(2)}`;

      if (cb.checked) {
        const qty = getItemQty(cb);
        const totalCost = (unitExtra * qty).toFixed(2);
        span.innerHTML = `${baseName} - ${unitExtraStr} <span style="color: #666; font-size: 0.9em; font-weight: normal;">(+ $${totalCost})</span>`;
      } else {
        span.textContent = `${baseName} - ${unitExtraStr}`;
      }
    });
  }
}

// Global portion history queues: each portion added pushes that item's value onto the queue.
// When an item's count decreases or it is unchecked, its most recent entry is removed.
let veggiePortionHistory = [];
let toppingPortionHistory = [];

function registerPortionAdd(category, itemValue) {
  if (category === 'veggies') {
    veggiePortionHistory.push(itemValue);
  } else if (category === 'toppings') {
    toppingPortionHistory.push(itemValue);
  }
}

function registerPortionRemove(category, itemValue) {
  const history = category === 'veggies' ? veggiePortionHistory : toppingPortionHistory;
  const lastIdx = history.lastIndexOf(itemValue);
  if (lastIdx !== -1) {
    history.splice(lastIdx, 1);
  }
}

function syncPortionHistory(category, checkboxes) {
  const history = category === 'veggies' ? veggiePortionHistory : toppingPortionHistory;
  const targetCounts = {};
  checkboxes.forEach(cb => {
    if (cb.checked) {
      targetCounts[cb.value] = getItemQty(cb);
    }
  });

  // Remove entries from history that exceed current counts or are unchecked
  const currentCounts = {};
  for (let i = history.length - 1; i >= 0; i--) {
    const val = history[i];
    const maxAllowed = targetCounts[val] || 0;
    const currentSoFar = currentCounts[val] || 0;
    if (currentSoFar >= maxAllowed) {
      history.splice(i, 1);
    } else {
      currentCounts[val] = currentSoFar + 1;
    }
  }

  // Add any missing portions if needed
  Object.keys(targetCounts).forEach(val => {
    const needed = targetCounts[val] - (currentCounts[val] || 0);
    for (let j = 0; j < needed; j++) {
      history.push(val);
    }
  });
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
    const veggieCheckboxes = Array.from(veggieStep.querySelectorAll('input[type="checkbox"]'));
    syncPortionHistory('veggies', veggieCheckboxes);

    let totalVeggiePortions = veggiePortionHistory.length;

    // Count extra portions per item: portions from index freeVeggiesCount onwards in history
    const extraCounts = {};
    for (let i = freeVeggiesCount; i < veggiePortionHistory.length; i++) {
      const val = veggiePortionHistory[i];
      extraCounts[val] = (extraCounts[val] || 0) + 1;
    }

    veggieCheckboxes.forEach(cb => {
      const span = cb.nextElementSibling;
      if (!span) return;
      
      let baseText = span.getAttribute('data-base-text');
      if (!baseText) {
        baseText = span.textContent.replace(/ - \$\d+\.\d+/, '');
        span.setAttribute('data-base-text', baseText);
      }

      if (cb.checked) {
        const extraPortions = extraCounts[cb.value] || 0;
        if (extraPortions > 0) {
          span.innerHTML = `${baseText} <span style="color: #666; font-size: 0.9em; font-weight: normal;">(+ $${(extraPortions * 1.30).toFixed(2)})</span>`;
        } else {
          span.textContent = baseText;
        }
      } else {
        // Unselected options: show price if user has reached/exceeded free limit
        if (freeVeggiesCount > 0 && totalVeggiePortions >= freeVeggiesCount) {
          span.textContent = baseText + ' - $1.30';
        } else {
          span.textContent = baseText;
        }
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
    const toppingCheckboxes = Array.from(toppingStep.querySelectorAll('input[type="checkbox"]'));
    syncPortionHistory('toppings', toppingCheckboxes);

    let totalToppingPortions = toppingPortionHistory.length;

    // Count extra portions per item: portions from index freeToppingsCount onwards in history
    const extraCounts = {};
    for (let i = freeToppingsCount; i < toppingPortionHistory.length; i++) {
      const val = toppingPortionHistory[i];
      extraCounts[val] = (extraCounts[val] || 0) + 1;
    }

    toppingCheckboxes.forEach(cb => {
      const span = cb.nextElementSibling;
      if (!span) return;
      
      let baseText = span.getAttribute('data-base-text');
      if (!baseText) {
        baseText = span.textContent.replace(/ - \$\d+\.\d+/, '');
        span.setAttribute('data-base-text', baseText);
      }

      if (cb.checked) {
        const extraPortions = extraCounts[cb.value] || 0;
        if (extraPortions > 0) {
          span.innerHTML = `${baseText} <span style="color: #666; font-size: 0.9em; font-weight: normal;">(+ $${(extraPortions * 2.30).toFixed(2)})</span>`;
        } else {
          span.textContent = baseText;
        }
      } else {
        // Unselected options: show price if user has reached/exceeded free limit
        if (freeToppingsCount > 0 && totalToppingPortions >= freeToppingsCount) {
          span.textContent = baseText + ' - $2.30';
        } else {
          span.textContent = baseText;
        }
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
      cb.addEventListener('change', () => {
        updateProteinUI();
        calculateTotalPrice();
      });
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

  updateProteinUI();
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
    const qty = getItemQty(cb);
    if (extraAttr) {
      proteinExtra += (parseFloat(extraAttr) || 0) * qty;
    }
  });

  let veggieExtra = 0;
  const checkedVeggies = document.querySelectorAll('#step-4 input[type="checkbox"]:checked');
  let freeVeggiesCount = 0;
  if (sizeValue === 'small') freeVeggiesCount = 2;
  else if (sizeValue === 'regular') freeVeggiesCount = 3;
  else if (sizeValue === 'large') freeVeggiesCount = 4;

  let totalVeggiePortions = 0;
  checkedVeggies.forEach(cb => {
    totalVeggiePortions += getItemQty(cb);
  });

  if (totalVeggiePortions > freeVeggiesCount) {
    veggieExtra = (totalVeggiePortions - freeVeggiesCount) * 1.30;
  }

  let toppingExtra = 0;
  const checkedToppings = document.querySelectorAll('#step-5 input[type="checkbox"]:checked');
  let freeToppingsCount = 0;
  if (sizeValue === 'small') freeToppingsCount = 1;
  else if (sizeValue === 'regular') freeToppingsCount = 2;
  else if (sizeValue === 'large') freeToppingsCount = 3;

  let totalToppingPortions = 0;
  checkedToppings.forEach(cb => {
    totalToppingPortions += getItemQty(cb);
  });

  if (totalToppingPortions > freeToppingsCount) {
    toppingExtra = (totalToppingPortions - freeToppingsCount) * 2.30;
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
    // Bowl overall quantity +/- in summary
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

    // Per-item stepper in summary
    if (e.target.classList.contains('summary-item-minus')) {
      const item = e.target.closest('.summary-item');
      if (!item) return;
      const name = item.getAttribute('data-input-name');
      const val = item.getAttribute('data-input-value');
      const row = document.querySelector(`.option-row:has(input[name="${name}"][value="${val}"])`);
      if (row) {
        const rowMinus = row.querySelector('.item-minus');
        if (rowMinus) {
          rowMinus.click();
          populateOrderSummary(summaryContent);
        }
      }
      return;
    }

    if (e.target.classList.contains('summary-item-plus')) {
      const item = e.target.closest('.summary-item');
      if (!item) return;
      const name = item.getAttribute('data-input-name');
      const val = item.getAttribute('data-input-value');
      const row = document.querySelector(`.option-row:has(input[name="${name}"][value="${val}"])`);
      if (row) {
        const rowPlus = row.querySelector('.item-plus');
        if (rowPlus) {
          rowPlus.click();
          populateOrderSummary(summaryContent);
        }
      }
      return;
    }

    // Toggle item selection when clicking on the checkbox or label
    const contentTarget = e.target.closest('.summary-item-content');
    if (!contentTarget) return;

    const item = contentTarget.closest('.summary-item');
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
      populateOrderSummary(summaryContent);
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
  const generateSection = (title, nameAttr, supportsQty = false) => {
    let checked = Array.from(document.querySelectorAll(`input[name="${nameAttr}"]:checked`));
    let sectionHtml = `<div class="summary-section"><div class="summary-title">${title}</div>`;
    
    if (checked.length === 0) {
      sectionHtml += `<div class="summary-item empty-text">None selected</div>`;
    } else {
      // Calculate extra counts from portion history queues
      const extraCounts = {};
      if (nameAttr === 'veggies') {
        for (let i = freeVeggiesCount; i < veggiePortionHistory.length; i++) {
          const val = veggiePortionHistory[i];
          extraCounts[val] = (extraCounts[val] || 0) + 1;
        }
      } else if (nameAttr === 'toppings') {
        for (let i = freeToppingsCount; i < toppingPortionHistory.length; i++) {
          const val = toppingPortionHistory[i];
          extraCounts[val] = (extraCounts[val] || 0) + 1;
        }
      }

      checked.forEach((cb) => {
        let labelText = cb.value;
        if (cb.nextElementSibling) {
          if (nameAttr === 'protein') {
            labelText = cb.nextElementSibling.getAttribute('data-base-name') || cb.nextElementSibling.textContent.split(' - ')[0].trim();
          } else {
            labelText = cb.nextElementSibling.getAttribute('data-base-text') || cb.nextElementSibling.textContent.replace(/ - \$\d+\.\d+/, '').split(' (+')[0].trim();
          }
        }

        const qty = getItemQty(cb);

        if (nameAttr === 'veggies') {
          const extra = extraCounts[cb.value] || 0;
          if (extra > 0) {
            labelText += ` <span style="color: #666; font-size: 0.9em;">(+ $${(extra * 1.30).toFixed(2)})</span>`;
          }
        } else if (nameAttr === 'toppings') {
          const extra = extraCounts[cb.value] || 0;
          if (extra > 0) {
            labelText += ` <span style="color: #666; font-size: 0.9em;">(+ $${(extra * 2.30).toFixed(2)})</span>`;
          }
        } else if (nameAttr === 'protein') {
          const extraPrice = cb.getAttribute('data-extra');
          if (extraPrice) {
            const totalProteinPrice = (parseFloat(extraPrice) * qty).toFixed(2);
            labelText += ` <span style="color: #666; font-size: 0.9em;">(+ $${totalProteinPrice})</span>`;
          }
        }

        const stepperHtml = supportsQty ? `
          <div class="summary-item-stepper">
            <button type="button" class="item-qty-btn summary-item-minus" aria-label="Decrease quantity">-</button>
            <span class="item-qty-count">${qty}</span>
            <button type="button" class="item-qty-btn summary-item-plus" aria-label="Increase quantity">+</button>
          </div>
        ` : '';

        sectionHtml += `
          <div class="summary-item" data-input-name="${nameAttr}" data-input-value="${cb.value}">
            <div class="summary-item-content" style="cursor: pointer;">
              <div class="summary-item-box checked">&#10003;</div>
              <span>${labelText}</span>
            </div>
            ${stepperHtml}
          </div>
        `;
      });
    }
    sectionHtml += `</div>`;
    return sectionHtml;
  };

  html += generateSection('Base', 'base', false);
  html += generateSection('Proteins', 'protein', true);
  html += generateSection('Veggies', 'veggies', true);
  html += generateSection('Toppings', 'toppings', true);
  html += generateSection('Sauces', 'sauces', false);
  html += generateSection('Garnishes', 'garnishes', false);

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
        .map(el => {
          const baseName = el.nextElementSibling.textContent.split(' - ')[0].trim();
          const qty = getItemQty(el);
          return qty > 1 ? `${baseName} x${qty}` : baseName;
        });

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
