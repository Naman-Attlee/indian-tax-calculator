// src/taxEngine.js
import { TAX_CONFIG } from './taxConfig';

export const calculateTax = (grossIncome, config = TAX_CONFIG) => {
  
  // 1. Standard Deduction
  const taxableIncome = Math.max(0, grossIncome - config.standardDeduction);

  // 2. Calculate Slab Tax
  let tax = 0;
  let breakdown = [];
  let remainingIncome = taxableIncome;

  config.slabs.forEach((slab) => {
    if (remainingIncome <= 0) return;

    const slabAmount = Math.min(remainingIncome, slab.limit);
    const slabTax = slabAmount * slab.rate;

    if (slabAmount > 0) {
      breakdown.push({
        label: slab.label,
        rate: `${(slab.rate * 100).toFixed(0)}%`,
        amount: slabAmount,
        tax: slabTax
      });
    }

    tax += slabTax;
    remainingIncome -= slabAmount;
  });

  // 3. Rebate Check (u/s 87A)
  let isRebateApplied = false;
  if (taxableIncome <= config.rebateThreshold) {
    tax = 0;
    isRebateApplied = true;
    breakdown = breakdown.map(item => ({ 
      ...item, 
      tax: 0, 
      note: "Rebate Applied" 
    }));
  }

  // 4. Marginal Relief Check
  if (!isRebateApplied && taxableIncome > config.rebateThreshold) {
    const incomeAboveThreshold = taxableIncome - config.rebateThreshold;
    if (tax > incomeAboveThreshold) {
      tax = incomeAboveThreshold;
      breakdown.push({
        label: "Marginal Relief",
        rate: "Relief",
        amount: 0,
        tax: 0, 
        note: "Tax capped at excess income"
      });
    }
  }

  // 5. Cess
  const cess = tax * config.cessRate;
  const finalTax = tax + cess;

  return {
    gross: grossIncome,
    taxable: taxableIncome,
    stdDeduction: config.standardDeduction,
    baseTax: tax,
    cess: cess,
    finalTax: finalTax,
    breakdown: breakdown,
    inHandMonthly: (grossIncome - finalTax) / 12
  };
};

export const calculateOldRegime = (grossIncome, investments) => {
  // 1. Deduct Investments (80C, 80D, HRA combined)
  // Old regime allows Standard Deduction too (50k usually, but let's assume 75k for parity or check rules)
  // Actually, for Old Regime, Std Deduction is ₹50,000.
  const STD_DEDUCTION_OLD = 50000; 
  
  const taxableIncome = Math.max(0, grossIncome - STD_DEDUCTION_OLD - investments);

  // 2. Calculate Tax on Old Slabs
  let tax = 0;
  let remaining = taxableIncome;
  
  // Hardcoded Old Slabs (simplest way)
  const slabs = [
    { limit: 250000, rate: 0 },
    { limit: 250000, rate: 0.05 },
    { limit: 500000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 }
  ];

  slabs.forEach(slab => {
    if (remaining <= 0) return;
    const amount = Math.min(remaining, slab.limit);
    tax += amount * slab.rate;
    remaining -= amount;
  });

  // 3. Rebate (Old Regime Limit is 5L, not 12L)
  if (taxableIncome <= 500000) {
    tax = 0;
  }

  // 4. Cess
  const cess = tax * 0.04;
  return tax + cess;
};