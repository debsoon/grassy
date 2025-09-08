'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Upload, ArrowLeft, Wallet } from 'lucide-react'
import { useAccount, useConnect } from 'wagmi'

export default function SubmitPage() {
  const [image, setImage] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!image || !caption.trim()) {
      alert('Please provide an image and caption')
      return
    }

    if (!isConnected || !address) {
      alert('Please connect your wallet first')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const formData = new FormData()
      formData.append('image', image)
      formData.append('caption', caption)
      formData.append('walletAddress', address)

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setSubmitStatus('success')
        setImage(null)
        setCaption('')
        const fileInput = document.getElementById('image') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Submission failed')
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
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

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-green-800 mb-4">
              🌱 Submit to Grassy
            </h1>
            <p className="text-lg text-green-700">
              Upload your image with a caption. If approved, it will be minted as a Zora content coin and you&apos;ll receive $GRASSY tokens!
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Wallet Connection Status */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              {isConnected ? (
                <div className="flex items-center text-green-700">
                  <Wallet className="w-5 h-5 mr-2" />
                  <span className="font-medium">Connected: </span>
                  <span className="ml-1 font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-3">Connect your wallet to submit content</p>
                  <button
                    type="button"
                    onClick={() => connect({ connector: connectors[0] })}
                    disabled={isPending}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    {isPending ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label htmlFor="image" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600">
                      {image ? image.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </label>
                </div>
                {image && (
                  <div className="mt-4">
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Preview"
                      className="w-full max-w-md mx-auto rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
                  Caption
                </label>
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Describe your image... What makes it special?"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {caption.length}/280 characters
                </p>
              </div>

              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-green-800 font-medium">
                    ✅ Submission successful! Your content is now pending review.
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800 font-medium">
                    ❌ Submission failed. Please try again.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !image || !caption.trim() || !isConnected}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Submitting...' : !isConnected ? 'Connect Wallet First' : 'Submit to Grassy'}
              </button>
            </form>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ol className="list-decimal list-inside text-blue-800 space-y-1">
              <li>Your submission will be reviewed manually</li>
              <li>If approved, it gets minted as a Zora content coin</li>
              <li>You automatically receive $GRASSY token rewards</li>
              <li>Your content becomes part of the Grassy collection!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}