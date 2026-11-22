import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Users, Calendar, ShieldCheck, Plus, CheckSquare, Mail, AlertTriangle } from 'lucide-react'
import useOrgStore from '../context/orgStore'
import useTaskStore from '../context/Taskstore'
import Avatar from '../components/organisations/Avatar'
import RoleBadge from '../components/organisations/RoleBadge'
import MemberRow from '../components/organisations/MemberRow'
import InvitationRow from '../components/organisations/InvitationRow'
import InviteForm from '../components/organisations/InviteForm'
import OrganisationForm from '../components/organisations/OrganisationForm'
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from '../components/tasks/TaskForm'
import TaskFilters from '../components/tasks/TaskFilters'

const TABS = ['home', 'tasks', 'members', 'invitations', 'settings']

function StatTile({ label, value, icon: Icon, warning }) {
    return (
        <div className={`glass-card p-5 rounded-2xl border flex items-center justify-between ${warning ? 'border-red-200' : 'border-purple-100'}`}>
            <div className="min-w-0">
                <div className="text-2xl font-bold text-slate-900 truncate">{value}</div>
                <div className="text-xs text-slate-500 mt-1">{label}</div>
            </div>
            {Icon && (
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${warning ? 'bg-red-100 text-red-600' : 'bg-purple-100/80 text-purple-700'}`}>
                    <Icon className="w-5 h-5" />
                </div>
            )}
        </div>
    )
}

function EmptyState({ icon: Icon, message, actionLabel, onAction }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center glass-card rounded-2xl border border-purple-100">
            <Icon className="w-8 h-8 text-purple-300" />
            <p className="text-slate-500 text-sm">{message}</p>
            {actionLabel && (
                <button
                    type="button"
                    onClick={onAction}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 font-medium text-xs text-white transition"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{actionLabel}</span>
                </button>
            )}
        </div>
    )
}

export default function OrganisationDetailPage() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const {
        currentOrg, members, invitations,
        isLoading, isLoadingMembers, isLoadingInvitations,
        fetchOrganisation, fetchMembers, fetchInvitations,
        deleteOrganisation, resetCurrentOrg,
    } = useOrgStore()
    const {
        tasks, count: taskCount, stats: taskStats,
        isLoading: isLoadingTasks, isLoadingStats,
        fetchTasks, fetchStats, resetTasks,
    } = useTaskStore()

    const [tab, setTab] = useState('home')
    const [showInviteForm, setShowInviteForm] = useState(false)
    const [showSettingsForm, setShowSettingsForm] = useState(false)
    const [showTaskForm, setShowTaskForm] = useState(false)
    const [editingTask, setEditingTask] = useState(null)
    const [taskFilters, setTaskFilters] = useState({})

    useEffect(() => {
        fetchOrganisation(slug)
        return () => { resetCurrentOrg(); resetTasks() }
    }, [slug])

    useEffect(() => {
        if (tab === 'members') fetchMembers(slug)
        if (tab === 'invitations') fetchInvitations(slug)
        if (tab === 'home') fetchStats(slug)
    }, [tab, slug])

    useEffect(() => {
        if (tab !== 'tasks') return
        const clean = Object.fromEntries(
            Object.entries(taskFilters).filter(([, v]) => v !== '')
        )
        fetchTasks(clean, slug)
    }, [tab, slug, taskFilters])

    const handleEditTask = (task) => {
        setEditingTask(task)
        setShowTaskForm(true)
    }

    const handleCloseTaskForm = () => {
        setShowTaskForm(false)
        setEditingTask(null)
    }

    const canManage = currentOrg?.your_role === 'admin' || currentOrg?.your_role === 'owner'
    const isOwner = currentOrg?.your_role === 'owner'

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${currentOrg.name}"? This cannot be undone.`)) return
        const result = await deleteOrganisation(slug)
        if (result.success) navigate('/organisations')
    }

    if (isLoading && !currentOrg) {
        return <div className="text-sm text-slate-500 py-24 text-center">Loading organisation...</div>
    }
    if (!currentOrg) return null

    return (
        <div className="space-y-6">
            <Link
                to="/organisations"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-purple-700 transition"
            >
                <ArrowLeft className="w-4 h-4" />
                Organisations
            </Link>

            <div className="flex items-center gap-4">
                <Avatar src={currentOrg.logo} name={currentOrg.name} size={64} />
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{currentOrg.name}</h1>
                    <div className="flex items-center gap-3 mt-1.5">
                        <RoleBadge role={currentOrg.your_role} />
                        <span className="text-sm text-slate-500">
                            {currentOrg.member_count} {currentOrg.member_count === 1 ? 'member' : 'members'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-1 bg-purple-50 p-1 rounded-xl border border-purple-100 w-fit">
                {TABS.map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setTab(t)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                            tab === t ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-purple-700'
                        }`}
                    >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {tab === 'home' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatTile label="Members" value={currentOrg.member_count} icon={Users} />
                        <StatTile
                            label="Created"
                            value={new Date(currentOrg.created_at).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric',
                            })}
                            icon={Calendar}
                        />
                        <div className="glass-card p-5 rounded-2xl border border-purple-100 flex items-center justify-between">
                            <div>
                                <RoleBadge role={currentOrg.your_role} />
                                <div className="text-xs text-slate-500 mt-2">Your role</div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-purple-100/80 text-purple-700 flex-shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Tasks</h2>
                        {isLoadingStats ? (
                            <div className="text-sm text-slate-500 py-12 text-center">Loading task stats...</div>
                        ) : !taskStats || taskStats.total === 0 ? (
                            <EmptyState
                                icon={CheckSquare}
                                message="No tasks in this organisation yet."
                                actionLabel="Go to Tasks"
                                onAction={() => setTab('tasks')}
                            />
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <StatTile label="Total tasks" value={taskStats.total} />
                                    <StatTile label="To do" value={taskStats.by_status.todo} />
                                    <StatTile label="In progress" value={taskStats.by_status.in_progress} />
                                    <StatTile label="Done" value={taskStats.by_status.done} />
                                    <StatTile label="Overdue" value={taskStats.overdue} warning={taskStats.overdue > 0} icon={taskStats.overdue > 0 ? AlertTriangle : undefined} />
                                </div>

                                <div className="flex w-full h-2 rounded-full overflow-hidden bg-slate-100 mt-4" title="Status breakdown">
                                    {taskStats.by_status.todo > 0 && (
                                        <div
                                            className="h-full bg-slate-300"
                                            style={{ width: `${(taskStats.by_status.todo / taskStats.total) * 100}%` }}
                                        />
                                    )}
                                    {taskStats.by_status.in_progress > 0 && (
                                        <div
                                            className="h-full bg-purple-500"
                                            style={{ width: `${(taskStats.by_status.in_progress / taskStats.total) * 100}%` }}
                                        />
                                    )}
                                    {taskStats.by_status.done > 0 && (
                                        <div
                                            className="h-full bg-emerald-500"
                                            style={{ width: `${(taskStats.by_status.done / taskStats.total) * 100}%` }}
                                        />
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {tab === 'tasks' && (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="text-sm text-slate-500">
                            {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowTaskForm(true)}
                            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-medium text-sm text-white transition shadow-lg shadow-purple-500/25"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Task</span>
                        </button>
                    </div>

                    <TaskFilters filters={taskFilters} onChange={setTaskFilters} />

                    {isLoadingTasks ? (
                        <div className="text-sm text-slate-500 py-12 text-center">Loading tasks...</div>
                    ) : tasks.length === 0 ? (
                        <EmptyState
                            icon={CheckSquare}
                            message="No tasks yet."
                            actionLabel="Create your first task"
                            onAction={() => setShowTaskForm(true)}
                        />
                    ) : (
                        <div className="space-y-3">
                            {tasks.map((task) => (
                                <TaskCard key={task.id} task={task} slug={slug} onEdit={handleEditTask} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {tab === 'members' && (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="text-sm text-slate-500">
                            {members.length} {members.length === 1 ? 'member' : 'members'}
                        </div>
                        {canManage && (
                            <button
                                type="button"
                                onClick={() => setShowInviteForm(true)}
                                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-medium text-sm text-white transition shadow-lg shadow-purple-500/25"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Invite teammate</span>
                            </button>
                        )}
                    </div>
                    {isLoadingMembers ? (
                        <div className="text-sm text-slate-500 py-12 text-center">Loading members...</div>
                    ) : (
                        <div className="space-y-3">
                            {members.map((m) => (
                                <MemberRow key={m.id} member={m} slug={slug} canManage={canManage} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {tab === 'invitations' && (
                <div className="space-y-4">
                    {!canManage ? (
                        <EmptyState icon={Mail} message="Only admins and owners can view invitations." />
                    ) : (
                        <>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="text-sm text-slate-500">
                                    {invitations.length} {invitations.length === 1 ? 'invitation' : 'invitations'}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowInviteForm(true)}
                                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-medium text-sm text-white transition shadow-lg shadow-purple-500/25"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Invite teammate</span>
                                </button>
                            </div>
                            {isLoadingInvitations ? (
                                <div className="text-sm text-slate-500 py-12 text-center">Loading invitations...</div>
                            ) : invitations.length === 0 ? (
                                <EmptyState icon={Mail} message="No invitations sent yet." />
                            ) : (
                                <div className="space-y-3">
                                    {invitations.map((inv) => (
                                        <InvitationRow key={inv.id} invitation={inv} slug={slug} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {tab === 'settings' && (
                <div className="space-y-6 max-w-xl">
                    <div className="glass-panel p-6 rounded-2xl border border-purple-100">
                        <h2 className="text-base font-semibold text-slate-900 mb-1">General</h2>
                        <p className="text-sm text-slate-500 mb-4">Update your organisation's name and logo.</p>
                        <button
                            type="button"
                            onClick={() => setShowSettingsForm(true)}
                            disabled={!canManage}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Edit organisation
                        </button>
                    </div>

                    {isOwner && (
                        <div className="p-6 rounded-2xl border border-red-200 bg-red-50/40">
                            <h2 className="text-base font-semibold text-red-700 mb-1">Danger zone</h2>
                            <p className="text-sm text-red-600/80 mb-4">
                                Deleting an organisation permanently removes all its data. This cannot be undone.
                            </p>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition"
                            >
                                Delete organisation
                            </button>
                        </div>
                    )}
                </div>
            )}

            {showInviteForm && <InviteForm slug={slug} onClose={() => setShowInviteForm(false)} />}
            {showSettingsForm && (
                <OrganisationForm org={currentOrg} onClose={() => setShowSettingsForm(false)} />
            )}
            {showTaskForm && (
                <TaskForm task={editingTask} slug={slug} onClose={handleCloseTaskForm} />
            )}
        </div>
    )
}
