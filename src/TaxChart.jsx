import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const TaxChart = ({ breakdown }) => {
  // Prepare data: We only want slabs where tax > 0 or it's the first slab
  const data = breakdown.map((item, index) => ({
    name: item.label.split(' - ')[0], // Shorten label "4L - 8L" -> "4L"
    tax: item.tax,
    income: item.amount,
    rate: item.rate
  }));

  return (
    <div className="h-48 md:h-64 w-full mt-6 print:hidden">
      <h3 className="text-lg font-bold text-gray-800 mb-2">Tax Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            formatter={(value, name) => [
              new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value),
              name === 'tax' ? 'Tax Paid' : 'Income in Slab'
            ]}
            cursor={{fill: 'transparent'}}
          />
          <Bar dataKey="tax" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4F46E5' : '#818CF8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};