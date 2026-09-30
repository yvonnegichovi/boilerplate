import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'
import useOrgStore from '../../context/orgStore'
import Avatar from './Avatar'
import Modal from '../common/Modal'
import { labelClass, inputClass, cancelButtonClass, submitButtonClass, errorAlertClass, fieldErrorClass } from '../common/formStyles'

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
        <Modal title={isEditing ? 'Organisation settings' : 'New organisation'} onClose={onClose}>
            {error?.name && (
                <div className={errorAlertClass}>
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{Array.isArray(error.name) ? error.name[0] : error.name}</span>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div>
                    <label className={labelClass}>
                        Logo <span className="normal-case font-normal text-slate-400">(optional)</span>
                    </label>
                    <div className="flex items-center gap-4">
                        <Avatar src={logoPreview} name={org?.name} size={56} />
                        <label className="cursor-pointer px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition">
                            Choose image
                            <input type="file" accept="image/*" onChange={handleLogoChange} hidden />
                        </label>
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Organisation name</label>
                    <input
                        {...register('name', { required: 'Name is required' })}
                        placeholder="Acme Inc."
                        className={inputClass}
                    />
                    {errors.name && <p className={fieldErrorClass}>{errors.name.message}</p>}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" className={cancelButtonClass} onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className={submitButtonClass} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create organisation'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
