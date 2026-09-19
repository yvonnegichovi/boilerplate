import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Users, ChevronRight, Plus, ShieldCheck } from 'lucide-react';

import useOrgStore from '../context/orgStore';
import OrganisationForm from '../components/organisations/OrganisationForm';
import Avatar from '../components/organisations/Avatar';

export default function OrganisationsPage() {
    const { organisations, isLoading, fetchOrganisations } = useOrgStore();
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchOrganisations();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Organizations</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage workspaces, access levels, and team members</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-medium text-sm text-white transition shadow-lg shadow-purple-500/25"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Organization</span>
                </button>
            </div>

            {isLoading ? (
                <div className="text-sm text-slate-500 py-12 text-center">Loading organizations...</div>
            ) : organisations.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center glass-card rounded-2xl border border-purple-100">
                    <Building2 className="w-8 h-8 text-purple-300" />
                    <p className="text-slate-500 text-sm">You're not part of any organizations yet.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 font-medium text-xs text-white transition"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create your first organization</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {organisations.map((org) => (
                        <motion.div
                            key={org.id}
                            whileHover={{ y: -4 }}
                            className="glass-card p-6 rounded-2xl border border-purple-100 bg-white/80 shadow-sm flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <Avatar src={org.logo} name={org.name} size={44} />
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 capitalize">
                                        {org.your_role}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{org.name}</h3>
                                <div className="mt-3 flex items-center space-x-4 text-xs text-slate-500">
                                    <span className="flex items-center">
                                        <Users className="w-3.5 h-3.5 mr-1" /> {org.member_count} {org.member_count === 1 ? 'member' : 'members'}
                                    </span>
                                    <span className="flex items-center">
                                        <ShieldCheck className="w-3.5 h-3.5 mr-1 text-purple-600" /> {org.your_role}
                                    </span>
                                </div>
                            </div>

                            <Link
                                to={`/organisations/${org.slug}`}
                                className="mt-6 w-full py-2 px-3 rounded-lg border border-purple-200 text-purple-700 text-xs font-semibold hover:bg-purple-50 flex items-center justify-center space-x-1 transition"
                            >
                                <span>View Details</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}

            {showForm && <OrganisationForm onClose={() => setShowForm(false)} />}
        </div>
    );
}
