import { createTask } from '../services/task.service'
import { useNavigate } from 'react-router-dom'
import TaskModal from './TaskModal'

const CreateTask = () => {
    const navigate = useNavigate()

    const initialValues = { title: '', description: '', dueDate: '', status: 'pending' }

    const handleSubmit = async (values, { setSubmitting, setStatus }) => {
        try {
            const data = await createTask(values)
            const notice = data?.message || 'Task created successfully'
            navigate('/', { state: { notice } })
        } catch (err) {
            setStatus(err.response?.data?.message || 'Failed to create task')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <TaskModal
            open
            title="Create New Task"
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onClose={() => navigate('/')}
            submitLabel="Create Task"
        />
    )
}

export default CreateTask;
