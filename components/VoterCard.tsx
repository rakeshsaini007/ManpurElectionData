
import React, { useState, useEffect } from 'react';
import { Voter, DeleteReason } from '../types';
import ScannerModal from './ScannerModal';

interface VoterCardProps {
  voter: Voter;
  onSave: (voter: Voter) => void;
  onDelete: (voter: Voter, reason: DeleteReason) => void;
  allVoters: Voter[];
}

const VoterCard: React.FC<VoterCardProps> = ({ voter, onSave, onDelete, allVoters }) => {
  const [formData, setFormData] = useState<Voter>(voter);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteReason, setDeleteReason] = useState<DeleteReason>(DeleteReason.MARRIAGE);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    // Calculate Age as of 1 Jan 2026
    if (formData.dob) {
      const dobDate = new Date(formData.dob.split('/').reverse().join('-'));
      if (!isNaN(dobDate.getTime())) {
        const targetDate = new Date('2026-01-01');
        let age = targetDate.getFullYear() - dobDate.getFullYear();
        const m = targetDate.getMonth() - dobDate.getMonth();
        if (m < 0 || (m === 0 && targetDate.getDate() < dobDate.getDate())) {
          age--;
        }
        setFormData(prev => ({ ...prev, calculatedAge: age.toString() }));
      }
    }
  }, [formData.dob]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsModified(true);
  };

  const handleSave = () => {
    // Check Aadhaar Uniqueness (excluding current record)
    const duplicate = allVoters.find(v => 
      v.aadhaar === formData.aadhaar && 
      v.svn !== formData.svn && 
      formData.aadhaar !== ''
    );
    
    if (duplicate) {
      alert(`Warning: Aadhaar already exists for ${duplicate.name} (SVN: ${duplicate.svn})`);
      return;
    }

    onSave(formData);
    setIsModified(false);
  };

  return (
    <div className={`bg-white border-l-4 ${voter.isNew ? 'border-green-500' : 'border-indigo-500'} rounded-xl shadow-sm p-6 mb-6 transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start mb-6 border-b pb-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">SVN</span>
          <h2 className="text-xl font-bold text-slate-800">{formData.svn || 'NEW_RECORD'}</h2>
          <p className="text-sm text-slate-500">बूथ: {formData.boothNo} | वार्ड: {formData.wardNo} | मकान: {formData.houseNo}</p>
        </div>
        <div className="flex gap-2">
          {!voter.isNew && (
            <button 
              onClick={() => setIsDeleting(true)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <i className="fa-solid fa-trash-can"></i>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Photo Section */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-32 h-40 bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-200 flex items-center justify-center relative">
            {formData.photo ? (
              <img src={formData.photo} alt="Aadhaar Capture" className="w-full h-full object-cover" />
            ) : (
              <i className="fa-solid fa-user-plus text-slate-300 text-4xl"></i>
            )}
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="absolute bottom-2 right-2 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <i className="fa-solid fa-camera text-xs"></i>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 uppercase font-bold">Aadhaar Photo</p>
        </div>

        {/* Editable Fields */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">निर्वाचक का नाम</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">पिता/पति/माता का नाम</label>
            <input
              type="text"
              name="relativeName"
              value={formData.relativeName}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">लिंग</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="म">म</option>
              <option value="पु">पु</option>
              <option value="अन्य">अन्य</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">आयु (Base)</label>
            <input
              type="text"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">जन्म तिथि (DD/MM/YYYY)</label>
            <input
              type="text"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              placeholder="DD/MM/YYYY"
              className="w-full px-3 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">आधार संख्या</label>
            <input
              type="text"
              name="aadhaar"
              value={formData.aadhaar}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
            />
          </div>
          <div className="space-y-1 sm:col-span-2 bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex justify-between items-center">
            <label className="text-sm font-bold text-indigo-700">उम्र (01-Jan-2026 तक):</label>
            <span className="text-xl font-black text-indigo-800">{formData.calculatedAge || '-'}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t flex justify-end gap-3">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-cloud-arrow-up"></i>
          {voter.isNew ? 'Submit' : 'Update'}
        </button>
      </div>

      {isScannerOpen && (
        <ScannerModal 
          onClose={() => setIsScannerOpen(false)}
          onCapture={(data) => {
            setFormData(prev => ({ 
              ...prev, 
              aadhaar: data.aadhaar, 
              dob: data.dob, 
              photo: data.photo 
            }));
            setIsModified(true);
          }}
        />
      )}

      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">हटाने का कारण चुनें</h3>
            <select
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value as DeleteReason)}
              className="w-full px-3 py-2 bg-slate-50 border rounded-lg mb-6 outline-none focus:ring-2 focus:ring-red-500"
            >
              {Object.values(DeleteReason).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsDeleting(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg">Cancel</button>
              <button 
                onClick={() => onDelete(formData, deleteReason)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoterCard;
