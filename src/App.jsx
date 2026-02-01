import { useState, useEffect, useRef } from 'react';
import { calculateTax, calculateOldRegime } from './taxEngine';
import { TAX_CONFIG } from './taxConfig';
import { Download, IndianRupee } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { TaxChart } from './TaxChart';

function App() {
  // 1. State Management (LocalStorage + Logic)
  const [income, setIncome] = useState(() => {
    const saved = localStorage.getItem("tax_income");
    return saved ? Number(saved) : 2000000; 
  });

  const [investments, setInvestments] = useState(() => {
    const saved = localStorage.getItem("tax_investments");
    return saved ? Number(saved) : 0;
  });

  const [showComparison, setShowComparison] = useState(() => {
    const saved = localStorage.getItem("tax_show_comparison");
    return saved === "true"; 
  });

  const [result, setResult] = useState(null);
  const [oldRegimeTax, setOldRegimeTax] = useState(0);
  
  const componentRef = useRef();

  useEffect(() => {
    const newData = calculateTax(Number(income));
    setResult(newData);

    if (showComparison) {
      const oldTax = calculateOldRegime(Number(income), Number(investments));
      setOldRegimeTax(oldTax);
    }

    localStorage.setItem("tax_income", income);
    localStorage.setItem("tax_investments", investments);
    localStorage.setItem("tax_show_comparison", showComparison);

  }, [income, investments, showComparison]); 

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Tax-Statement-${TAX_CONFIG.year}`,
  });

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans text-gray-800">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header - Screen Only */}
        <div className="bg-blue-600 p-6 text-white print:hidden">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <IndianRupee className="w-6 h-6" /> 
            Indian Tax Calculator
          </h1>
          <p className="text-blue-100 mt-2 text-sm">{TAX_CONFIG.year} • New Regime</p>
        </div>

        {/* Input Section - Screen Only */}
        <div className="p-6 border-b border-gray-100 bg-gray-50 print:hidden">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Enter Gross Annual Income
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-500 text-lg">₹</span>
            <input 
              type="number"
              min="0"
              value={income}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 0) setIncome(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-3 text-xl font-semibold text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Comparison Toggle - Screen Only */}
        <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-100 flex items-center justify-between print:hidden">
          <div>
            <p className="text-sm font-bold text-yellow-800">Have Investments?</p>
            <p className="text-xs text-yellow-600">Compare with Old Regime</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={showComparison} 
              onChange={(e) => setShowComparison(e.target.checked)} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
          </label>
        </div>

        {/* Investment Input - Screen Only */}
        {showComparison && (
          <div className="p-6 bg-yellow-50/50 border-b border-yellow-100 animate-in slide-in-from-top-2 print:hidden">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Total Exemptions (80C + 80D + HRA)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500">₹</span>
              <input 
                type="number"
                min="0"
                value={investments} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 0) setInvestments(e.target.value);
                }}
                className="w-full pl-8 pr-4 py-2 text-lg font-semibold border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              />
            </div>
            
            <div className="mt-4 p-4 bg-white rounded-lg border border-yellow-200 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Old Regime Tax</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(oldRegimeTax)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-bold">Verdict</p>
                {result && (result.finalTax < oldRegimeTax ? (
                  <span className="text-green-600 font-bold bg-green-100 px-2 py-1 rounded text-sm">
                    New Regime saves {formatCurrency(oldRegimeTax - result.finalTax)}
                  </span>
                ) : (
                  <span className="text-blue-600 font-bold bg-blue-100 px-2 py-1 rounded text-sm">
                    Old Regime saves {formatCurrency(result.finalTax - oldRegimeTax)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------------- */}
        {/* THE RESULTS SECTION (Wrapped in ref)                                        */}
        {/* This contains BOTH the Screen View (print:hidden) AND Print View (hidden)   */}
        {/* -------------------------------------------------------------------------- */}
        {result && (
          <div ref={componentRef}>
            
            {/* === 1. SCREEN VIEW (Visible on Website, Hidden in PDF) === */}
            <div className="p-6 print:hidden">
              
              {/* Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-red-50 border border-red-100 p-5 rounded-xl">
                  <p className="text-red-600 font-medium text-sm uppercase">Total Tax Payable</p>
                  <p className="text-3xl font-bold text-red-700 mt-1">{formatCurrency(result.finalTax)}</p>
                </div>
                <div className="bg-green-50 border border-green-100 p-5 rounded-xl">
                  <p className="text-green-600 font-medium text-sm uppercase">Monthly In-Hand</p>
                  <p className="text-3xl font-bold text-green-700 mt-1">{formatCurrency(result.inHandMonthly)}</p>
                </div>
              </div>

              {/* Chart */}
              <TaxChart breakdown={result.breakdown} />
              
              {/* Mobile Optimized Table */}
              <h3 className="text-lg font-bold text-gray-800 mb-4 mt-8">Tax Breakdown</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-tighter md:tracking-normal">Slab</th>
                      <th className="px-1 md:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rate</th>
                      <th className="px-2 md:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tax</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {result.breakdown.map((row, index) => (
                      <tr key={index} className={row.tax === 0 ? "text-gray-400" : "text-gray-900"}>
                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm font-medium whitespace-nowrap">{row.label}</td>
                        <td className="px-1 md:px-4 py-3 text-xs md:text-sm text-center">{row.rate}</td>
                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-right font-mono font-bold">
                          {row.note ? <span className="text-[10px] md:text-xs text-green-600 uppercase block">{row.note}</span> : formatCurrency(row.tax)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold">
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm" colSpan="2">Cess (4%)</td>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-right font-mono">{formatCurrency(result.cess)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Download Button */}
              <div className="mt-8 flex justify-center">
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-full font-medium transition-colors shadow-lg cursor-pointer"
                >
                  <Download size={18} />
                  Download PDF
                </button>
              </div>
            </div>

            {/* === 2. PRINT VIEW (Hidden on Website, Visible in PDF) === */}
            <div className="hidden print:block p-8 bg-white text-black relative">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
                 <IndianRupee size={400} />
              </div>

              {/* Print Header */}
              <div className="mb-8 border-b-2 border-gray-800 pb-4 flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-bold uppercase tracking-wide text-gray-900">Tax Statement</h1>
                  <p className="text-sm font-medium text-gray-600 mt-1">Assessment Year 2026-27</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Generated On</p>
                  <p className="font-mono font-bold">{new Date().toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              {/* Print Summary */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Gross Income</p>
                  <p className="text-2xl font-mono font-bold border-l-4 border-blue-600 pl-3 mt-1">{formatCurrency(result.gross)}</p>
                </div>
                {showComparison && investments > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Deductions (Old)</p>
                    <p className="text-2xl font-mono font-bold border-l-4 border-yellow-500 pl-3 mt-1">{formatCurrency(investments)}</p>
                  </div>
                )}
              </div>

              {/* Print Big Numbers */}
              <div className="border-2 border-gray-900 rounded-lg p-6 mb-8 bg-gray-50">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-300">
                  <span className="text-lg font-bold">Total Tax Payable</span>
                  <span className="text-2xl font-bold font-mono">{formatCurrency(result.finalTax)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-600">Monthly In-Hand</span>
                  <span className="text-2xl font-bold font-mono text-gray-600">{formatCurrency(result.inHandMonthly)}</span>
                </div>
              </div>

              {/* Print Table */}
              <h3 className="text-sm font-bold uppercase text-gray-500 mb-2">Detailed Breakdown</h3>
              <table className="w-full text-sm mb-8 border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="text-left py-2">Slab</th>
                    <th className="text-center py-2">Rate</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((row, index) => (
                    <tr key={index} className="border-b border-gray-300">
                      <td className="py-2">{row.label}</td>
                      <td className="text-center py-2">{row.rate}</td>
                      <td className="text-right py-2 font-mono">{row.note ? row.note : formatCurrency(row.tax)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="2" className="py-2 font-bold text-right pr-4">Cess (4%)</td>
                    <td className="text-right py-2 font-mono font-bold">{formatCurrency(result.cess)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-12 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
                Generated via Indian Tax Calculator • Not an official legal document.
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}

export default App;