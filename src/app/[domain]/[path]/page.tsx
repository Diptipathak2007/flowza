import React from 'react'

const Page = async ({ params }: { params: Promise<{ domain: string, path: string }> }) => {
  const { domain, path } = await params;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Subdomain: {domain}</h1>
      <h2 className="text-2xl mt-4">Path: {path}</h2>
      <p className="mt-4 text-xl">This is a dynamic sub-page inside your domain.</p>
    </div>
  )
}

export default Page
