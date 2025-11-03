'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Trash2, Plus, DollarSign, Calendar, User, CreditCard, TrendingUp } from 'lucide-react';

export default function AdminPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ consumer_id: '', total_amount: '', due_date: '', user_id: '' });
  const router = useRouter();

  useEffect(() => {
    const checkAccessAndFetch = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return router.push('/login');

      const { data: roleData } = await supabase
        .from('roles')
        .select('role')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (roleData?.role !== 'admin') return router.push('/403');

      const token = (await supabase.auth.getSession()).data.session.access_token;
      const res = await fetch('/api/admin/getBills', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      setBills(result.bills || []);
      setLoading(false);
    };

    checkAccessAndFetch();
  }, [router]);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addBill = async () => {
    const token = (await supabase.auth.getSession()).data.session.access_token;
    const res = await fetch('/api/admin/addBill', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    const result = await res.json();
    if (res.ok) {
      setBills([...bills, result.bill[0]]);
      setForm({ consumer_id: '', total_amount: '', due_date: '', user_id: '' });
    } else {
      alert(result.error);
    }
  };

  const deleteBill = async (id) => {
    const token = (await supabase.auth.getSession()).data.session.access_token;
    await fetch(`/api/admin/deleteBill?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setBills(bills.filter((b) => b.id !== id));
  };

  const updateBill = async (id, field, value) => {
    const token = (await supabase.auth.getSession()).data.session.access_token;
    await fetch('/api/admin/updateBill', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, field, value }),
    });
    setBills(bills.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const totalAmount = bills.reduce((sum, bill) => sum + (parseFloat(bill.bill_amount) || 0), 0);
  const avgAmount = bills.length > 0 ? totalAmount / bills.length : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage and track all billing operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white transition-all duration-300 transform ">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <CreditCard className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Total Bills</h3>
            <p className="text-3xl font-bold">{bills.length}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white transition-all duration-300 transform ">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <DollarSign className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Total Amount</h3>
            <p className="text-3xl font-bold">${totalAmount.toFixed(2)}</p>
          </div>

          <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-6 text-white transition-all duration-300 transform ">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Calendar className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Average Bill</h3>
            <p className="text-3xl font-bold">${avgAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Add New Bill Card */}
        <div className="bg-white rounded-2xl  p-8 mb-8 border border-gray-100 duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-xl">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Add New Bill</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Consumer ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="consumer_id"
                  value={form.consumer_id}
                  onChange={handleInput}
                  placeholder="e.g., C001"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="total_amount"
                  value={form.total_amount}
                  onChange={handleInput}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="due_date"
                  value={form.due_date}
                  onChange={handleInput}
                  type="date"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="user_id"
                  value={form.user_id}
                  onChange={handleInput}
                  placeholder="e.g., U001"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>
            </div>
          </div>

          <button
            onClick={addBill}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Bill
          </button>
        </div>

        {/* Bills Table */}
        <div className="bg-white rounded-2xl  overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-bold text-gray-800">All Bills</h2>
            <p className="text-sm text-gray-600 mt-1">{bills.length} total records</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Consumer ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bills.map((bill) => (
                  <tr
                    key={bill.id}
                    className="hover:bg-blue-50 transition-colors duration-200 group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="font-medium text-gray-900">{bill.consumer_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative inline-block">
                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={bill.bill_amount}
                          onChange={(e) => updateBill(bill.id, 'bill_amount', e.target.value)}
                          step="0.01"
                          className="pl-7 pr-3 py-2 border border-gray-200 rounded-lg w-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="date"
                        value={bill.due_date?.split('T')[0]}
                        onChange={(e) => updateBill(bill.id, 'due_date', e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {bill.user_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteBill(bill.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium group-hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {bills.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bills yet</h3>
              <p className="text-gray-600">Add your first bill to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}