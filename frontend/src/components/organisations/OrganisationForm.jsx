import { useState } from 'react'
import { useForm } from 'react-hook-form'
import useOrgStore from '../../context/orgStore'
import Avatar from './Avatar'

export default function OrganisationForm({ org = null, onClose, onSuccess }) {
    const { createOrganisation, updateOrganisation, isSubmitting, error } = useOrgStore()
    const isEditing = !!org

    const [logoFile, setLogoFile] = useState(null)
    const [logoPreview, setLogoPreview] = useState(org?.logo || null)

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { name: org?.name || '' },
    })

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setLogoFile(file)
        setLogoPreview(URL.createObjectURL(file))
    }

    const onSubmit = async (data) => {
        let payload
        if (logoFile) {
            payload = new FormData()
            payload.append('name', data.name)
            payload.append('logo', logoFile)
        } else {
            payload = { name: data.name }
        }

        const result = isEditing
            ? await updateOrganisation(org.slug, payload)
            : await createOrganisation(payload)

        if (result.success) {
            onSuccess?.(result.data)
            onClose()
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2>{isEditing ? 'Organisation settings' : 'New organisation'}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                {error?.name && (
                    <div className="alert alert-error">
                        {Array.isArray(error.name) ? error.name[0] : error.name}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="field logo-field">
                        <label>Logo <span className="field-optional">(optional)</span></label>
                        <div className="logo-picker">
                            <Avatar src={logoPreview} name={org?.name} size={56} />
                            <label className="btn btn-outline logo-upload-btn">
                                Choose image
                                <input type="file" accept="image/*" onChange={handleLogoChange} hidden />
                            </label>
                        </div>
                    </div>

                    <div className="field">
                        <label>Organisation name</label>
                        <input
                            {...register('name', { required: 'Name is required' })}
                            placeholder="Acme Inc."
                        />
                        {errors.name && <span className="field-error">{errors.name.message}</span>}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create organisation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
