import React from 'react'

const Page = ({ params }: { params: { domain: string, path: string } }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Subdomain: {params.domain}</h1>
      <h2 className="text-2xl mt-4">Path: {params.path}</h2>
      <p className="mt-4 text-xl">This is a dynamic sub-page inside your domain.</p>
    </div>
  )
}

export default Page
