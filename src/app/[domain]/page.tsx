import React from 'react'

const Page = ({ params }: { params: { domain: string } }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Welcome to {params.domain}</h1>
      <p className="mt-4 text-xl">This is a custom subdomain landing page.</p>
    </div>
  )
}

export default Page
