import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useState } from 'react'
import api from '../services/api.service'

const schema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  dueDate: Yup.string().required('Due date is required'),
  status: Yup.string().oneOf(['pending', 'in-progress', 'completed']).required('Status is required'),
})

export default function TaskModal({ open, title, initialValues, onSubmit, onClose, submitLabel = 'Save', isAdminCreate = false }) {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (open && isAdminCreate && user?.role === 'admin') {
      fetchUsers()
    }
  }, [open, isAdminCreate, user])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await api.get('/auth/users')
      setUsers(response.data)
      setSelectedUsers([])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSubmit = async (values, formikHelpers) => {
    if (isAdminCreate && user?.role === 'admin' && selectedUsers.length === 0) {
      formikHelpers.setStatus('Please select at least one user to assign the task')
      return
    }

    if (isAdminCreate && user?.role === 'admin') {
      return onSubmit({
        ...values,
        assignedUserIds: selectedUsers
      }, formikHelpers)
    }

    return onSubmit(values, formikHelpers)
  }

  return (
    <dialog open={open} className="modal">
      <div className="modal-box w-11/12 max-w-md space-y-4 max-h-screen overflow-y-auto">
        <h3 className="font-bold text-lg">{title}</h3>
        <Formik
          initialValues={initialValues}
          validationSchema={schema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, status }) => (
            <Form className="space-y-4">
              <div className="form-control w-full space-y-2">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <Field name="title" type="text" className="input input-bordered w-full" placeholder="Task Title" />
                <ErrorMessage name="title" component="div" className="text-error text-sm" />
              </div>

              <div className="form-control w-full space-y-2">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <Field as="textarea" name="description" className="textarea textarea-bordered h-28 w-full" placeholder="Task Description" />
                <ErrorMessage name="description" component="div" className="text-error text-sm" />
              </div>

              <div className="form-control w-full space-y-2">
                <label className="label">
                  <span className="label-text">Due Date</span>
                </label>
                <Field name="dueDate" type="date" className="input input-bordered w-full" />
                <ErrorMessage name="dueDate" component="div" className="text-error text-sm" />
              </div>

              <div className="form-control w-full space-y-2">
                <label className="label">
                  <span className="label-text">Status</span>
                </label>
                <Field name="status" as="select" className="select select-bordered w-full">
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </Field>
                <ErrorMessage name="status" component="div" className="text-error text-sm" />
              </div>

              {isAdminCreate && user?.role === 'admin' && (
                <div className="form-control w-full space-y-2">
                  <label className="label">
                    <span className="label-text">Assign To Users</span>
                  </label>
                  {loadingUsers ? (
                    <div className="text-center">
                      <span className="loading loading-spinner loading-sm"></span>
                    </div>
                  ) : (
                    <div className="border border-base-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                      {users.filter(u => u._id !== user._id).map(u => (
                        <label key={u._id} className="label cursor-pointer justify-start gap-3">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={selectedUsers.includes(u._id)}
                            onChange={() => handleUserToggle(u._id)}
                          />
                          <span className="label-text text-sm">{u.name} ({u.email})</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {selectedUsers.length === 0 && (
                    <p className="text-warning text-sm">Please select at least one user</p>
                  )}
                </div>
              )}

              {status && (
                <div className="alert alert-error">
                  <span>{status}</span>
                </div>
              )}

              <div className="modal-action">
                <button type="button" className="btn" onClick={onClose} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting && <span className="loading loading-spinner loading-xs mr-2"></span>}
                  {submitLabel}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </dialog>
  )
}
