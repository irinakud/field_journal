import { useState, useEffect, useCallback } from 'react'
import { observationsApi, type Observation, type CreateObservationPayload } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/ToastProvider'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { PlusCircle, MapPin, Calendar, Trash2, Pencil, Bird } from 'lucide-react'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

interface ObsFormProps {
  initial?: Partial<CreateObservationPayload>
  onSubmit: (p: CreateObservationPayload) => Promise<void>
  loading: boolean
}

function ObsForm({ initial, onSubmit, loading }: ObsFormProps) {
  const [form, setForm] = useState<CreateObservationPayload>({
    species: initial?.species ?? '',
    location: initial?.location ?? '',
    notes: initial?.notes ?? '',
    photoUrl: initial?.photoUrl ?? '',
    latitude: initial?.latitude,
    longitude: initial?.longitude,
  })

  const set =
    (k: keyof CreateObservationPayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(form)
  }

  return (
    <form onSubmit={handle} className="flex flex-col gap-4">
      <Input label="Species *" value={form.species} onChange={set('species')} required placeholder="e.g. Red Kite" />
      <Input label="Location *" value={form.location} onChange={set('location')} required placeholder="e.g. Welsh countryside" />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={form.notes}
          onChange={set('notes')}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="What did you observe?"
        />
      </div>
      <Input label="Photo URL" value={form.photoUrl ?? ''} onChange={set('photoUrl')} placeholder="https://…" type="url" />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Latitude"
          type="number"
          step="any"
          value={form.latitude ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value ? +e.target.value : undefined }))}
          placeholder="51.507"
        />
        <Input
          label="Longitude"
          type="number"
          step="any"
          value={form.longitude ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value ? +e.target.value : undefined }))}
          placeholder="-0.127"
        />
      </div>
      <Button type="submit" loading={loading} className="mt-1 w-full">Save observation</Button>
    </form>
  )
}

function ObsCard({ obs, onEdit, onDelete, currentUserId }: {
  obs: Observation
  onEdit: (obs: Observation) => void
  onDelete: (id: number) => void
  currentUserId?: number
}) {
  const isOwner = obs.userId === currentUserId
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      {obs.photoUrl && (
        <img src={obs.photoUrl} alt={obs.species}
          className="mb-4 h-44 w-full rounded-xl object-cover" />
      )}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-1">
            <Bird className="h-4 w-4 text-emerald-500" />
            {obs.species}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" /> {obs.location}
          </p>
        </div>
        {isOwner && (
          <div className="flex gap-1 shrink-0">
            <button onClick={() => onEdit(obs)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => onDelete(obs.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {obs.notes && <p className="mt-2 text-sm text-gray-600 line-clamp-3">{obs.notes}</p>}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(obs.observedAt)}</span>
        <span>by {obs.username}</span>
      </div>
    </article>
  )
}

export default function JournalPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [observations, setObservations] = useState<Observation[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editObs, setEditObs] = useState<Observation | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      const { data } = await observationsApi.getAll()
      setObservations(data)
    } catch {
      toast({ title: 'Failed to load observations', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleCreate = async (payload: CreateObservationPayload) => {
    setSaving(true)
    try {
      const { data } = await observationsApi.create(payload)
      setObservations((prev) => [data, ...prev])
      setCreateOpen(false)
      toast({ title: 'Observation logged!', variant: 'success' })
    } catch {
      toast({ title: 'Failed to save', variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (payload: CreateObservationPayload) => {
    if (!editObs) return
    setSaving(true)
    try {
      const { data } = await observationsApi.update(editObs.id, payload)
      setObservations((prev) => prev.map((o) => (o.id === data.id ? data : o)))
      setEditObs(null)
      toast({ title: 'Observation updated!', variant: 'success' })
    } catch {
      toast({ title: 'Failed to update', variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await observationsApi.delete(id)
      setObservations((prev) => prev.filter((o) => o.id !== id))
      toast({ title: 'Observation deleted', variant: 'info' })
    } catch {
      toast({ title: 'Failed to delete', variant: 'error' })
    }
  }

  // Find current user's ID from any of their observations
  const currentUserId = observations.find((o) => o.username === user?.username)?.userId

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Journal</h1>
          <p className="text-sm text-gray-500 mt-0.5">Wildlife observations from the community</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="md">
          <PlusCircle className="h-4 w-4" />
          Log observation
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-400">Loading…</div>
      ) : observations.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-gray-400 gap-3">
          <Bird className="h-12 w-12 opacity-30" />
          <p>No observations yet. Be the first to log one!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {observations.map((obs) => (
            <ObsCard
              key={obs.id}
              obs={obs}
              onEdit={setEditObs}
              onDelete={handleDelete}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}

      <Modal open={createOpen} onOpenChange={setCreateOpen} title="Log a new observation" description="Record what you saw, where, and when.">
        <ObsForm onSubmit={handleCreate} loading={saving} />
      </Modal>

      <Modal open={!!editObs} onOpenChange={(o) => { if (!o) setEditObs(null) }} title="Edit observation">
        {editObs && <ObsForm initial={editObs} onSubmit={handleUpdate} loading={saving} />}
      </Modal>
    </div>
  )
}
