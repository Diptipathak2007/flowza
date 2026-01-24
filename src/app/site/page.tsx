import Image from "next/image";

export default function Home() {
  return (
    <>
    <section className="min-h-screen w-full pt-36 relative flex items-center justify-center flex-col">
      
      {/* Background grid */}
      <div className="absolute inset-0 -z-10
        dark:bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)]
        bg-[linear-gradient(to_right,#c4c2c2_1px,transparent_1px),linear-gradient(to_bottom,#c4c2c2_1px,transparent_1px)]
        bg-[size:1rem_1rem]
        [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]
      " />

      

      <p className="text-center text-lg mb-4">
        Run your agency, in one place
      </p>

      <h1 className="
        text-center
        font-bold
        text-7xl
        md:text-[200px]
        bg-gradient-to-r from-primary to-secondary-foreground
        text-transparent bg-clip-text
        leading-tight
      ">
        Flowza
      </h1>
      <div className="flex justify-center items-center relative md:mt-[-70px] px-4">
        <Image
          src="/assets/final-cherry-red-dashboard.png"
          alt="Flowza Dashboard Preview"
          width={1200}
          height={1200}
          className="rounded-xl border-2 border-muted shadow-2xl"
        />
      </div>


    </section>
    <section className="flex justify-center items-center flex-col gap-4 mt-20">
      <h2 className="text-4xl text-center">Choose What Fits You Right</h2>
      <p className="text-muted-foreground text-center">
        Our straightforward pricing plans are tailored to meet your needs.If{"you're"} not <br />ready to commit you can get started for free.
      </p>
      <div className="flex items-center gap-4 flex-wrap mt-6"></div>
    </section>
  
    </>
  );
}
