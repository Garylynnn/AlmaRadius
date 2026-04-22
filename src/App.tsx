/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Terminal, 
  Activity, 
  Settings, 
  FileText, 
  Key,
  ChevronRight,
  Server,
  Download,
  AlertCircle,
  RefreshCcw,
  Trash2,
  CheckCircle2,
  Monitor,
  Wifi
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 cursor-pointer ${
      active 
        ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/20' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
    }`}
  >
    <Icon size={18} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const StatCard = ({ label, value, trend, icon: Icon, color }: { label: string, value: string | number, trend?: string, icon: any, color: string }) => {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    purple: 'text-indigo-600',
    orange: 'text-amber-500',
    red: 'text-rose-500'
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center justify-between">
        <p className={`text-3xl font-bold ${colorMap[color] || 'text-slate-900'}`}>{value}</p>
        <div className={`p-1.5 rounded-lg bg-slate-50 text-slate-400`}>
          <Icon size={16} />
        </div>
      </div>
      {trend && (
        <div className={`mt-2 text-xs font-semibold ${trend.includes('+') ? 'text-emerald-600' : 'text-slate-500'}`}>
          {trend}
        </div>
      )}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [devices, setDevices] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newDevice, setNewDevice] = useState({ hostname: '', type: 'Access Point' });

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/devices');
      const data = await res.json();
      setDevices(data);
    } catch (err) {
      console.error("Failed to fetch devices", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDevice)
      });
      if (res.ok) {
        fetchDevices();
        setIsModalOpen(false);
        setNewDevice({ hostname: '', type: 'Access Point' });
      }
    } catch (err) {
      console.error("Failed to add host", err);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this host?")) return;
    try {
      await fetch(`/api/devices/${id}`, { method: 'DELETE' });
      fetchDevices();
    } catch (err) {
      console.error("Failed to revoke", err);
    }
  };

  const handleGenerateCert = async (hostname: string) => {
    try {
      const res = await fetch('/api/cert/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostname })
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert("Failed to generate cert");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar - Sleek Dark Theme */}
      <aside className="w-64 bg-slate-900 flex flex-col border-r border-slate-800 shadow-xl">
        <div className="p-6 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">AR</div>
            <span className="text-xl font-bold text-white tracking-tight">AlmaRadius</span>
          </div>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold">Certificate Authority Hub</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <div className="text-slate-600 text-[11px] font-bold uppercase px-3 mb-2 tracking-widest">Infrastructure</div>
          <SidebarItem 
            icon={Activity} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={Monitor} 
            label="Host Management" 
            active={activeTab === 'devices'} 
            onClick={() => setActiveTab('devices')} 
          />
          <div className="text-slate-600 text-[11px] font-bold uppercase px-3 mb-2 mt-8 tracking-widest">Security</div>
          <SidebarItem 
            icon={Key} 
            label="Certificate Center" 
            active={activeTab === 'certs'} 
            onClick={() => setActiveTab('certs')} 
          />
          <SidebarItem 
            icon={FileText} 
            label="Export Vault" 
            active={activeTab === 'docs'} 
            onClick={() => setActiveTab('docs')} 
          />
        </nav>

        <div className="p-4 bg-slate-950/50 mt-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-slate-300 font-bold tracking-tight uppercase">Master: 10.10.60.25</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="text-[10px] text-slate-300 font-bold tracking-tight uppercase">Replica: 10.10.60.26</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-800 capitalize">
            {activeTab === 'dashboard' ? 'Network Infrastructure Overview' : activeTab.replace('dashboard', 'Overview').replace('devices', 'Host Inventory').replace('certs', 'Security Center').replace('docs', 'Deployment Documentation')}
          </h1>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Realm</p>
              <p className="text-xs font-mono font-bold text-slate-700">ALMARADIUS.HO</p>
            </div>
            <div className="w-9 h-9 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shadow-inner">
              ZA
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Hosts" value={devices.length} trend="+2 New Today" icon={Monitor} color="blue" />
                <StatCard label="Online Devices" value={devices.filter(d => d.status === 'online').length} trend="97.1% Uptime" icon={Activity} color="green" />
                <StatCard label="Offline / Revoked" value={devices.filter(d => d.status !== 'online').length} trend="Requires Attention" icon={AlertCircle} color="red" />
                <StatCard label="Active Certs" value={devices.length} trend="2 Expiring Soon" icon={Shield} color="purple" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Plus size={16} className="text-blue-600" />
                    Provision New Host
                  </h3>
                  <form onSubmit={handleAddHost} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hostname</label>
                      <input 
                        required
                        type="text" 
                        value={newDevice.hostname}
                        onChange={(e) => setNewDevice({...newDevice, hostname: e.target.value})}
                        placeholder="ap-floor1"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Device Type</label>
                      <select 
                        value={newDevice.type}
                        onChange={(e) => setNewDevice({...newDevice, type: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none cursor-pointer"
                      >
                        <option>Access Point</option>
                        <option>Switch</option>
                        <option>Server</option>
                        <option>Workstation</option>
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                       <button 
                        type="submit"
                        className="flex-1 bg-blue-600 text-white text-[11px] font-bold py-2.5 rounded-md hover:bg-blue-700 transition-colors shadow-sm shadow-blue-100"
                      >
                        REGISTER HOST
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-4 leading-relaxed italic">
                      Automated: ipa host-add, openssl req, cert-request.
                    </p>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-800">Recent Inventory & Certificates</h3>
                    <button onClick={() => setActiveTab('devices')} className="text-[11px] font-bold text-blue-600 uppercase hover:underline">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="px-6 py-3">Hostname</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Certificate</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {devices.slice(0, 4).map((device) => (
                          <tr key={device.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-3.5 font-medium text-slate-800">{device.hostname}.al{/* ... */}</td>
                            <td className="px-6 py-3.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${device.status === 'online' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {device.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-slate-500 font-mono text-xs">{device.certExpires}</td>
                            <td className="px-6 py-3.5 text-right font-bold text-blue-600 cursor-pointer text-[10px] uppercase hover:underline" onClick={() => handleGenerateCert(device.hostname)}>
                              Renew
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Live CLI Stream Footer - Sleek Aesthetic */}
              <div className="mt-auto bg-slate-900 rounded-xl p-4 text-slate-400 flex items-center justify-between border border-slate-800 shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live CLI Stream</div>
                  <div className="font-mono text-xs text-emerald-400/80">$ ipa host-add {devices[0]?.hostname || 'node'}-02.almaradius.ho --force ... SUCCESS</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium">Last sync: {new Date().toLocaleTimeString()}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Hostname</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Cert Expiry</th>
                    <th className="px-6 py-4 text-right pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {devices.map((device) => (
                    <tr key={device.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{device.hostname}.almaradius.ho</td>
                      <td className="px-6 py-4 text-slate-500">{device.type}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${device.status === 'online' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {device.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">{device.certExpires}</td>
                      <td className="px-6 py-4 text-right pr-8 space-x-3">
                        <button onClick={() => handleGenerateCert(device.hostname)} className="text-[11px] font-bold text-blue-600 hover:underline uppercase">Renew</button>
                        <button onClick={() => handleRevoke(device.id)} className="text-[11px] font-bold text-rose-600 hover:underline uppercase">Revoke</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'certs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {devices.map((device) => (
                  <div key={device.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-2.5 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <Key size={20} />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                        <p className="text-xs font-bold text-emerald-600">VALID</p>
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-900 truncate mb-1">{device.hostname}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Expiry: {device.certExpires}</p>
                    
                    <div className="mt-8 grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleGenerateCert(device.hostname)}
                        className="bg-slate-900 text-white text-[10px] font-bold py-2.5 rounded hover:bg-black transition-colors uppercase tracking-wider"
                      >
                        Reprovision
                      </button>
                      <button 
                        className="bg-blue-600 text-white text-[10px] font-bold py-2.5 rounded hover:bg-blue-700 transition-all uppercase tracking-wider shadow-sm shadow-blue-100"
                      >
                        Down .p12
                      </button>
                    </div>
                  </div>
               ))}
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
               <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                 <FileText className="text-blue-600" />
                 Infrastructure Documentation
               </h2>
               <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Primary Master</p>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800">10.10.60.25</p>
                      <p className="text-xs text-slate-500 font-mono italic">ipa.almaradius.ho</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Replica Node</p>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800">10.10.60.26</p>
                      <p className="text-xs text-slate-500 font-mono italic">ipa2.almaradius.ho</p>
                    </div>
                  </div>
               </div>
               <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
                  <h4 className="text-slate-900 font-bold">RADIUS Enrollment Logic</h4>
                  <p>All device authentication follows EAP-TLS protocols. Certificates are issued via the <code>ipa cert-request</code> CLI tool and exported as PKCS#12 bundles for compatibility with network hardware.</p>
                  <pre className="bg-slate-900 text-emerald-400/90 p-4 rounded-lg font-mono text-xs overflow-x-auto shadow-inner">
{`# Lifecycle sequence:
ipa host-add $HOST --force
openssl req -new -nodes -keyout $HOST.key
ipa cert-request $HOST.csr --principal=host/$HOST
openssl pkcs12 -export -out $HOST.p12`}
                  </pre>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Modal - Sleek Styling */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-8 border border-slate-200"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-1">Provision New Host</h3>
              <p className="text-slate-400 text-sm mb-6">Enter hostname for automated FreeIPA registration.</p>
              
              <form onSubmit={handleAddHost} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Hostname</label>
                  <input 
                    required
                    type="text" 
                    value={newDevice.hostname}
                    onChange={(e) => setNewDevice({...newDevice, hostname: e.target.value})}
                    placeholder="e.g. ap-lobby-01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Device Type</label>
                  <select 
                    value={newDevice.type}
                    onChange={(e) => setNewDevice({...newDevice, type: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm outline-none"
                  >
                    <option>Access Point</option>
                    <option>Switch</option>
                    <option>Controller</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-blue-600 text-white text-[11px] font-bold py-2.5 rounded-md hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest"
                  >
                    Authorize
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

