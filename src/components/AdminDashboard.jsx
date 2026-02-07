/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import api from '../services/api.service';
import TaskList from './TaskList';
import TaskModal from './TaskModal';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [viewUserTasks, setViewUserTasks] = useState(null);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [showTaskList, setShowTaskList] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/task/admin/dashboard');
            setUsers(response.data);
        } catch {
            setError('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleViewTasks = (user) => {
        setViewUserTasks(user);
        setShowTaskList(true);
    };

    const handleEditTask = async (user) => {
        setEditingTaskId(user._id);
        setViewUserTasks(user);
        setShowTaskList(true);
    };

    const handleDeleteTask = async (user) => {
        if (window.confirm(`Delete all tasks for ${user.name}?`)) {
            try {
                // Fetch user's tasks first
                const tasksResponse = await api.get(`/task/admin/user/${user._id}`);
                const tasks = tasksResponse.data.tasks;

                // Delete each task
                for (const task of tasks) {
                    await api.delete(`/task/admin/${task._id}`);
                }

                fetchDashboardData();
                alert('All tasks deleted successfully');
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete tasks');
            }
        }
    };

    if (loading) return <div className="text-center mt-10"><span className="loading loading-spinner loading-lg"></span></div>;
    if (error) return <div className="alert alert-error mt-10 mx-auto w-96">{error}</div>;

    if (showTaskList && viewUserTasks) {
        return (
            <div className="container mx-auto p-4">
                <button
                    className="btn btn-ghost mb-4"
                    onClick={() => {
                        setShowTaskList(false);
                        setViewUserTasks(null);
                        setEditingTaskId(null);
                    }}
                >
                    ← Back to Dashboard
                </button>
                <TaskList userName={viewUserTasks.name} userId={viewUserTasks._id} />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingTask(null);
                        setModalOpen(true);
                    }}
                >
                    + Create Task for Users
                </button>
            </div>

            {users.length === 0 ? (
                <div className="text-center p-10 bg-base-200 rounded-box">
                    <p className="text-lg">No users found</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                        <thead>
                            <tr>
                                <th>Action</th>
                                <th>User Name</th>
                                <th>Email</th>
                                <th>Total Tasks</th>
                                <th>Completed</th>
                                <th>In Progress</th>
                                <th>Pending</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-sm btn-info"
                                                onClick={() => handleViewTasks(user)}
                                                title="View Tasks"
                                            >
                                                👁️
                                            </button>
                                            <button
                                                className="btn btn-sm btn-warning"
                                                onClick={() => handleEditTask(user)}
                                                title="Edit Task"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn btn-sm btn-error"
                                                onClick={() => handleDeleteTask(user)}
                                                title="Delete Task"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                    <td className="font-semibold">{user.name}</td>
                                    <td>{user.email}</td>
                                    <td className="font-bold">{user.totalTasks}</td>
                                    <td>
                                        <span className="badge badge-success">{user.completedTasks}</span>
                                    </td>
                                    <td>
                                        <span className="badge badge-warning">{user.inProgressTasks}</span>
                                    </td>
                                    <td>
                                        <span className="badge badge-ghost">{user.pendingTasks}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modalOpen && (
                <TaskModal
                    open={modalOpen}
                    title="Create Task for Users"
                    submitLabel="Create Task"
                    initialValues={{
                        title: '',
                        description: '',
                        dueDate: '',
                        status: 'pending',
                    }}
                    isAdminCreate={true}
                    onSubmit={async (values, { setSubmitting, setStatus }) => {
                        try {
                            await api.post('/task/admin/assign', {
                                title: values.title,
                                description: values.description,
                                dueDate: values.dueDate,
                                assignedUserIds: values.assignedUserIds
                            });
                            await fetchDashboardData();
                            setModalOpen(false);
                        } catch (err) {
                            setStatus(err.response?.data?.message || 'Failed to create task');
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                    onClose={() => {
                        setModalOpen(false);
                        setEditingTask(null);
                    }}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
