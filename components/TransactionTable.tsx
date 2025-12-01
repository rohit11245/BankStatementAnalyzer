import React from 'react';
import { TransactionTableProps } from '../types';
import { Download, AlertCircle, TrendingUp, TrendingDown, Hash, Calendar, FileText } from 'lucide-react';
import { generateCSV, downloadCSV } from '../utils/fileHelpers';

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, fileName }) => {
  const handleDownload = () => {
    const csv = generateCSV(transactions);
    const csvFileName = fileName.replace(/\.[^/.]+$/, "") + "_converted.csv";
    downloadCSV(csv, csvFileName);
  };

  if (transactions.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-900 rounded-xl border border-slate-800 shadow-sm mt-6">
        <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="text-slate-500" size={32} />
        </div>
        <h3 className="text-slate-200 font-medium text-lg">No transactions found</h3>
        <p className="text-slate-500 mt-1">We couldn't detect any structured transaction data in this document.</p>
      </div>
    );
  }

  // Calculate totals
  const totalCredits = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalCount = transactions.length;

  return (
    <div className="space-y-6 mt-10 animate-fade-in">
      {/* File Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <FileText className="text-blue-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{fileName}</h2>
            <p className="text-slate-400 text-sm">Processed successfully</p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-900/20 hover:shadow-blue-500/20 transition-all"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Count Card */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Hash size={64} className="text-slate-400" />
          </div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
              <Hash size={20} />
            </div>
            <span className="text-slate-400 font-medium text-sm">Total Transactions</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalCount}</p>
        </div>

        {/* Total Credit Card */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg relative overflow-hidden group hover:border-emerald-900/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={64} className="text-emerald-500" />
          </div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <TrendingUp size={20} />
            </div>
            <span className="text-slate-400 font-medium text-sm">Total Credits</span>
          </div>
          <p className="text-3xl font-bold text-emerald-400">
            +{totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Total Debit Card */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg relative overflow-hidden group hover:border-rose-900/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingDown size={64} className="text-rose-500" />
          </div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
              <TrendingDown size={20} />
            </div>
            <span className="text-slate-400 font-medium text-sm">Total Debits</span>
          </div>
          <p className="text-3xl font-bold text-rose-400">
            {totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Description</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {transactions.map((t, index) => (
                <tr key={index} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-slate-400 whitespace-nowrap border-l-2 border-transparent group-hover:border-blue-500 transition-all flex items-center gap-2">
                     <Calendar size={14} className="opacity-50" />
                    {t.transaction_date}
                  </td>
                  <td className="px-6 py-4 text-slate-200 font-medium">
                    {t.transaction_title_or_description}
                  </td>
                  <td className={`px-6 py-4 text-right font-mono font-bold ${t.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs max-w-xs truncate" title={t.notes}>
                    {t.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;