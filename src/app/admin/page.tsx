'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, X, Clock } from 'lucide-react'

interface Submission {
  id: string
  imageUrl: string
  caption: string
  submitterFid: string
  submitterAddress: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MINTED' | 'REWARDED'
  createdAt: string
}

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/submissions')
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions)
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id)
    
    try {
      const response = await fetch(`/api/admin/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ submissionId: id }),
      })

      if (response.ok) {
        await fetchSubmissions() // Refresh the list
      } else {
        alert(`Failed to ${action} submission`)
      }
    } catch (error) {
      console.error(`Error ${action}ing submission:`, error)
      alert(`Failed to ${action} submission`)
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      MINTED: 'bg-blue-100 text-blue-800',
      REWARDED: 'bg-purple-100 text-purple-800',
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 text-green-600 mx-auto mb-2 animate-spin" />
          <p className="text-green-700">Loading submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        <Link 
          href="/"
          className="inline-flex items-center text-green-700 hover:text-green-800 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            🛠️ Admin Dashboard
          </h1>
          <p className="text-lg text-green-700">
            Review and approve submissions for Grassy content coins
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {submissions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg">No submissions yet</p>
              <p className="text-gray-400 mt-2">New submissions will appear here for review</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {submissions.map((submission) => (
                <div key={submission.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={submission.imageUrl}
                    alt="Submission"
                    className="w-full h-48 object-cover"
                  />
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-gray-500">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </span>
                      {getStatusBadge(submission.status)}
                    </div>
                    
                    <p className="text-gray-800 mb-3 line-clamp-3">{submission.caption}</p>
                    
                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                      <p>👤 {submission.submitterFid}</p>
                      {submission.submitterAddress && (
                        <p>💳 {submission.submitterAddress.slice(0, 6)}...{submission.submitterAddress.slice(-4)}</p>
                      )}
                    </div>

                    {submission.status === 'PENDING' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAction(submission.id, 'approve')}
                          disabled={processingId === submission.id}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          {processingId === submission.id ? 'Processing...' : 'Approve'}
                        </button>
                        
                        <button
                          onClick={() => handleAction(submission.id, 'reject')}
                          disabled={processingId === submission.id}
                          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    )}
                    
                    {submission.status !== 'PENDING' && (
                      <div className="text-center py-2 text-gray-500">
                        {submission.status === 'APPROVED' && 'Approved - Minting in progress...'}
                        {submission.status === 'REJECTED' && 'Rejected'}
                        {submission.status === 'MINTED' && 'Minted - Content coin created successfully'}
                        {submission.status === 'REWARDED' && 'Complete - Content coin + rewards distributed'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}