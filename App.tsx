import React, { useState, useEffect, useMemo } from 'react';
import { Voter, DeleteReason } from './types';
import { fetchAllVoters, saveVoter, deleteVoter } from './services/gasService';
import VoterCard from './components/VoterCard';

const App: React.FC = () => {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  
  // Filters
  const [selectedBooth, setSelectedBooth] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedHouse, setSelectedHouse] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAllVoters();
    setVoters(data);
    setLoading(false);
  };

  // Extract unique filter options
  const booths = useMemo(() => Array.from(new Set(voters.map(v => v.boothNo))).sort(), [voters]);
  const wards = useMemo(() => {
    if (!selectedBooth) return [];
    return Array.from(new Set(voters.filter(v => v.boothNo === selectedBooth).map(v => v.wardNo))).sort();
  }, [voters, selectedBooth]);
  const houses = useMemo(() => {
    if (!selectedBooth || !selectedWard) return [];
    return Array.from(new Set(voters.filter(v => v.boothNo === selectedBooth && v.wardNo === selectedWard).map(v => v.houseNo))).sort();
  }, [voters, selectedBooth, selectedWard]);

  const filteredVoters = useMemo(() => {
    return voters.filter(v => {
      const matchBooth = !selectedBooth || v.boothNo === selectedBooth;
      const matchWard = !selectedWard || v.wardNo === selectedWard;
      const matchHouse = !selectedHouse || v.houseNo === selectedHouse;
      const matchSearch = !activeSearch || 
        v.name.toLowerCase().includes(activeSearch.toLowerCase()) || 
        v.relativeName.toLowerCase().includes(activeSearch.toLowerCase()) ||
        v.svn.toLowerCase().includes(activeSearch.toLowerCase());
      return matchBooth && matchWard && matchHouse && matchSearch;
    });
  }, [voters, selectedBooth, selectedWard, selectedHouse, activeSearch]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setActiveSearch(search);
  };

  const handleSave = async (voter: Voter) => {
    const res = await saveVoter(voter);
    if (res.success) {
      alert(res.message || 'Data saved successfully!');
      loadData();
    } else {
      alert('Error: ' + res.message);
    }
  };

  const handleDelete = async (voter: Voter, reason: DeleteReason) => {
    const res = await deleteVoter(voter, reason);
    if (res.success) {
      alert('Member moved to deleted sheet.');
      loadData();
    } else {
      alert('Delete failed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Voter <span className="text-indigo-600">Sync</span></h1>
          <p className="text-slate-500 font-medium">Digital Census & Data Management</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex-1 max-w-md w-full">
          <div className="relative flex items-center group">
            <div className="absolute left-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
            <input
              type="text"
              placeholder="Search by name or SVN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-24 py-3 border-2 border-slate-100 rounded-2xl bg-white shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-1.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-sm active:scale-95 transition-all"
            >
              Search
            </button>
          </div>
          {activeSearch && (
            <button 
              type="button"
              onClick={() => { setSearch(''); setActiveSearch(''); }}
              className="text-xs text-indigo-600 mt-2 ml-2 font-semibold hover:underline"
            >
              Clear Search
            </button>
          )}
        </form>
      </header>

      {/* Filters Bar */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 sticky top-4 z-40 backdrop-blur-md bg-white/90">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">बूथ संख्या</label>
            <select
              value={selectedBooth}
              onChange={(e) => { setSelectedBooth(e.target.value); setSelectedWard(''); setSelectedHouse(''); }}
              className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-indigo-500"
            >
              <option value="">Select Booth</option>
              {booths.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">वार्ड संख्या</label>
            <select
              value={selectedWard}
              onChange={(e) => { setSelectedWard(e.target.value); setSelectedHouse(''); }}
              disabled={!selectedBooth}
              className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-indigo-500 disabled:opacity-50"
            >
              <option value="">Select Ward</option>
              {wards.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">मकान नं०</label>
            <select
              value={selectedHouse}
              onChange={(e) => setSelectedHouse(e.target.value)}
              disabled={!selectedWard}
              className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-indigo-500 disabled:opacity-50"
            >
              <option value="">Select House</option>
              {houses.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
      <main>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-700">
            {activeSearch ? `Search Results for "${activeSearch}"` : 'Members'} ({filteredVoters.length})
          </h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <i className="fa-solid fa-spinner animate-spin text-4xl mb-4"></i>
            <p className="font-medium">Fetching Data...</p>
          </div>
        ) : filteredVoters.length > 0 ? (
          filteredVoters.map((voter, idx) => (
            <VoterCard 
              key={voter.svn || `record-${idx}`} 
              voter={voter} 
              onSave={handleSave} 
              onDelete={handleDelete}
              allVoters={voters}
            />
          ))
        ) : (
          <div className="text-center py-20 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">No members found for this criteria.</p>
            {activeSearch && (
              <button 
                onClick={() => { setSearch(''); setActiveSearch(''); }}
                className="mt-4 text-indigo-600 font-bold hover:underline"
              >
                Reset Search
              </button>
            )}
          </div>
        )}
      </main>

      <footer className="mt-20 text-center text-slate-400 text-sm pb-10">
        &copy; 2024 Election Commission Support Tool. All data is securely synced to private sheets.
      </footer>
    </div>
  );
};

export default App;