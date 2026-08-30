import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, ChevronRight, Plus, ShieldCheck } from 'lucide-react';

const orgs = [
  { id: 1, name: 'Acme Architecture', members: 12, plan: 'Enterprise', role: 'Owner' },
  { id: 2, name: 'Apex Engineering', members: 6, plan: 'Pro', role: 'Admin' },
  { id: 3, name: 'Starlight Labs', members: 24, plan: 'Enterprise', role: 'Member' }
];

export default function OrganisationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Organizations</h1>
          <p className="text-slate-500 text-sm mt-1">Manage workspaces, access levels, and team members</p>
        </div>
        <button className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-medium text-sm text-white transition shadow-lg shadow-purple-500/25">
          <Plus className="w-4 h-4" />
          <span>New Organization</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {orgs.map((org) => (
          <motion.div
            key={org.id}
            whileHover={{ y: -4 }}
            className="glass-card p-6 rounded-2xl border border-purple-100 bg-white/80 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-purple-100/80 text-purple-700">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {org.plan}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{org.name}</h3>
              <div className="mt-3 flex items-center space-x-4 text-xs text-slate-500">
                <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1" /> {org.members} members</span>
                <span className="flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1 text-purple-600" /> {org.role}</span>
              </div>
            </div>

            <button className="mt-6 w-full py-2 px-3 rounded-lg border border-purple-200 text-purple-700 text-xs font-semibold hover:bg-purple-50 flex items-center justify-center space-x-1 transition">
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
