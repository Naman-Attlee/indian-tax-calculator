// src/taxConfig.js

export const TAX_CONFIG = {
  // Current Financial Year
  year: "FY 2025-26",
  
  // The flat discount everyone gets
  standardDeduction: 75000, 
  
  // The "Zero Tax" limit (Rebate u/s 87A)
  // If taxable income is below this, tax is ZERO.
  rebateThreshold: 1200000, 
  
  // Health & Education Cess (Extra tax on tax)
  cessRate: 0.04, 

  // The Slabs
  slabs: [
    { limit: 400000, rate: 0, label: "0 - ₹4 Lakhs" },
    { limit: 400000, rate: 0.05, label: "₹4L - ₹8 Lakhs" },
    { limit: 400000, rate: 0.10, label: "₹8L - ₹12 Lakhs" },
    { limit: 400000, rate: 0.15, label: "₹12L - ₹16 Lakhs" },
    { limit: 400000, rate: 0.20, label: "₹16L - ₹20 Lakhs" },
    { limit: 400000, rate: 0.25, label: "₹20L - ₹24 Lakhs" },
    { limit: Infinity, rate: 0.30, label: "Above ₹24 Lakhs" }
  ],

  // ADD THIS: Old Regime Slabs
  oldRegimeSlabs: [
    { limit: 250000, rate: 0, label: "0 - ₹2.5 Lakhs" },
    { limit: 250000, rate: 0.05, label: "₹2.5L - ₹5 Lakhs" },
    { limit: 500000, rate: 0.20, label: "₹5L - ₹10 Lakhs" }, // The big jump!
    { limit: Infinity, rate: 0.30, label: "Above ₹10 Lakhs" }
  ],
  
  // Old Regime Rebate is lower (only up to 5L income)
  oldRegimeRebateLimit: 500000
};