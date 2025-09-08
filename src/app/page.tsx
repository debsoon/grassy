import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-green-800 mb-4">
            🌱 Grassy
          </h1>
          <p className="text-xl text-green-700 mb-8 max-w-2xl mx-auto">
            Submit your images and captions to be featured as Zora content coins. 
            Get rewarded with $GRASSY tokens for approved submissions!
          </p>
          
          <div className="space-y-4 max-w-md mx-auto">
            <Link 
              href="/submit"
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors"
            >
              Submit Content
            </Link>
            
            <Link 
              href="/admin"
              className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors"
            >
              Admin Panel
            </Link>
          </div>
          
          <div className="mt-12 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">📸 Submit</h3>
              <p className="text-green-600">Upload your image with a caption</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Approve</h3>
              <p className="text-green-600">Manual review and approval process</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">🪙 Mint & Reward</h3>
              <p className="text-green-600">Auto-mint as Zora content coin + $GRASSY rewards</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
