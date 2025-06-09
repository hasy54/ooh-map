import { Suspense } from "react"
import OOHMap from "../ooh-map"

function OOHMapWrapper() {
  return <OOHMap />
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading OOH Map...</p>
          </div>
        </div>
      }
    >
      <OOHMapWrapper />
    </Suspense>
  )
}
