import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getTasks, createTask, updateTask, getUserTasks } from '../services/task.service';
import { useAuth } from '../hooks/useAuth';
import TaskModal from './TaskModal';

const TaskList = ({ userName = null, userId = null }) => {
    const location = useLocation();
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [notice, setNotice] = useState('');

    const fetchTasks = useCallback(async () => {
        try {
            let data;
            if (userId && user?.role === 'admin') {
                // Admin viewing another user's tasks
                data = await getUserTasks(userId);
            } else {
                // Regular user viewing own tasks
                data = await getTasks();
            }
            setTasks(data.tasks);
        } catch {
            setError('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    }, [userId, user?.role]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    useEffect(() => {
        if (location.state?.notice) {
            setNotice(location.state.notice);
        }
    }, [location.state]);

    if (loading) return <div className="text-center mt-10"><span className="loading loading-spinner loading-lg"></span></div>;
    if (error) return <div className="alert alert-error mt-10 mx-auto w-96">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{userName ? `${userName}'s Tasks` : 'My Tasks'}</h2>
                {!userName && (
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setEditingTask(null);
                            setModalOpen(true);
                        }}
                    >
                        Create New Task
                    </button>
                )}
            </div>

            {notice && (
                <div className="alert alert-success mb-4">
                    <span>{notice}</span>
                </div>
            )}

            {tasks.length === 0 ? (
                <div className="text-center p-10 bg-base-200 rounded-box">
                    <p className="text-lg">No tasks found. Create one to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.map((task) => (
                        <div key={task._id} className="card bg-base-100 shadow-xl border border-base-200">
                            <div className="card-body">
                                <h3 className="card-title justify-between">
                                    {task.title}
                                    <div className={`badge ${task.status === 'completed' ? 'badge-success' :
                                        task.status === 'in-progress' ? 'badge-warning' : 'badge-ghost'
                                        } badge-sm`}>{task.status}</div>
                                </h3>
                                <p className="text-sm text-base-content/70">{task.description}</p>
                                <div className="mt-4 text-xs text-base-content/50">
                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                </div>
                                <div className="card-actions justify-end mt-4">
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => {
                                            setEditingTask(task);
                                            setModalOpen(true);
                                        }}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <TaskModal
                    open={modalOpen}
                    title={editingTask ? 'Edit Task' : 'Create New Task'}
                    submitLabel={editingTask ? 'Update Task' : 'Create Task'}
                    initialValues={
                        editingTask
                            ? {
                                title: editingTask.title || '',
                                description: editingTask.description || '',
                                dueDate: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : '',
                                status: editingTask.status || 'pending',
                            }
                            : { title: '', description: '', dueDate: '', status: 'pending' }
                    }
                    onSubmit={async (values, { setSubmitting, setStatus }) => {
                        try {
                            if (editingTask) {
                                await updateTask(editingTask._id, values);
                            } else {
                                const data = await createTask(values);
                                if (data?.emailSent && data?.message) {
                                    setNotice(data.message);
                                } else {
                                    setNotice('Task created successfully');
                                }
                            }
                            await fetchTasks();
                            setModalOpen(false);
                            setEditingTask(null);
                        } catch (err) {
                            setStatus(err.response?.data?.message || 'Failed to save task');
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

export default TaskList;
