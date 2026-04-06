import { useState, useEffect } from 'react'
import { getNewsletterSubsApi, sendNewsletterApi } from '../../api/admin.api'
import Spinner from '../../components/common/Spinner'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [sending,     setSending]     = useState(false)
  const [form,        setForm]        = useState({ subject: '', content: '' })

  useEffect(() => {
    getNewsletterSubsApi()
      .then(res => setSubscribers(res.data.subscribers))
      .finally(() => setLoading(false))
  }, [])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!window.confirm(`Send newsletter to ${subscribers.length} subscribers?`)) return
    try {
      setSending(true)
      const res = await sendNewsletterApi(form)
      toast.success(`Sent to ${res.data.sent} subscribers!`)
      setForm({ subject: '', content: '' })
    } catch { toast.error('Failed to send newsletter') }
    finally { setSending(false) }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Newsletter</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Compose */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-4">Send Newsletter</h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Subject</label>
              <input
                required value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Email subject line"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Content (HTML supported)</label>
              <textarea
                required rows={8} value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono"
                placeholder="<h2>Hello!</h2><p>Your newsletter content here...</p>"
              />
            </div>
            <button
              type="submit" disabled={sending}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {sending ? 'Sending...' : `Send to ${subscribers.length} subscribers`}
            </button>
          </form>
        </div>

        {/* Subscribers list */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Subscribers</h2>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full">
              {subscribers.length} active
            </span>
          </div>
          {loading ? <Spinner /> : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {subscribers.map(s => (
                <div key={s._id} className="flex justify-between items-center text-sm py-1 border-b last:border-0">
                  <span className="text-gray-700">{s.email}</span>
                  <span className="text-xs text-gray-400">{formatDate(s.subscribedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}