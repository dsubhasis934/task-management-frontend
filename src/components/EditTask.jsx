import { updateTask } from '../services/task.service'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import TaskModal from './TaskModal'

const EditTask = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const task = location.state?.task

    if (!task) {
        navigate('/')
        return null
    }

    const initialValues = {
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        status: task.status || 'pending',
    }

    const handleSubmit = async (values, { setSubmitting, setStatus }) => {
        try {
            await updateTask(id, values)
            navigate('/')
        } catch (err) {
            setStatus(err.response?.data?.message || 'Failed to update task')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <TaskModal
            open
            title="Edit Task"
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onClose={() => navigate('/')}
            submitLabel="Update Task"
        />
    )
}

export default EditTask;
