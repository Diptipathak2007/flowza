import Image from "next/image";
import { PRICING, type PricingItem } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PricingCard = ({
  title,
  description,
  price,
  duration,
  highlight,
  features,
  priceId,
}: PricingItem) => {
  return (
    <Card
      className={cn(
        "flex flex-col justify-between w-full md:w-87.5 min-h-100 dark:bg-[#05070a] bg-white border-2",
        {
          "border-primary shadow-lg": title === "Unlimited Saas",
          "dark:border-muted border-gray-200": title !== "Unlimited Saas",
        }
      )}
    >
      <CardHeader>
        <CardTitle
          className={cn("text-2xl", {
            "dark:text-white text-gray-900": title === "Unlimited Saas",
            "dark:text-muted-foreground text-gray-700": title !== "Unlimited Saas",
          })}
        >
          {title}
        </CardTitle>
        <CardDescription className="dark:text-muted-foreground text-gray-600">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-bold dark:text-white text-gray-900">{price}</span>
          <span className="dark:text-muted-foreground text-gray-600 text-sm">/m</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-6">
        <div className="flex flex-col gap-3">
          {features.map((feature) => (
            <div key={feature} className="flex gap-2 items-center">
              <Check className="dark:text-muted-foreground text-primary h-5 w-5" />
              <p className="text-sm dark:text-muted-foreground text-gray-700">{feature}</p>
            </div>
          ))}
        </div>
        <Link
          href={`/agency?plan=${priceId}`}
          className={cn(
            "w-full text-center p-2 rounded-md font-semibold transition-all",
            {
              "bg-primary text-white hover:bg-primary/90":
                title === "Unlimited Saas",
              "dark:bg-muted-foreground/20 bg-gray-100 dark:text-white text-gray-900 dark:hover:bg-muted-foreground/30 hover:bg-gray-200":
                title !== "Unlimited Saas",
            }
          )}
        >
          Get Started
        </Link>
      </CardFooter>
    </Card>
  );
};

export default function Home() {
  return (
    <>
      <section className="min-h-screen w-full pt-36 relative flex items-center justify-center flex-col">
        {/* Background grid */}
        <div
          className="absolute inset-0 -z-10
        dark:bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)]
        bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)]
        bg-size-[1rem_1rem]
        mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]
      "
        />

        <p className="text-center text-lg mb-4 dark:text-muted-foreground text-gray-700 font-medium">
          Run your agency, in one place
        </p>

        <h1
          className="
        text-center
        font-bold
        text-7xl
        md:text-[200px]
        bg-linear-to-r from-primary to-secondary-foreground
        dark:from-primary dark:to-secondary-foreground
        text-transparent bg-clip-text
        leading-tight
        relative
        z-0
      "
        >
          Flowza
        </h1>
        <div className="flex justify-center items-center relative md:-mt-10 px-4 z-10">
          <Image
            src="/assets/light-dashboard.png"
            alt="Flowza Dashboard Preview"
            width={1200}
            height={1200}
            priority
            unoptimized
            className="rounded-xl border-2 dark:hidden border-gray-300 shadow-2xl"
          />
          <Image
            src="/assets/final-cherry-red-dashboard.png"
            alt="Flowza Dashboard Preview"
            width={1200}
            height={1200}
            priority
            unoptimized
            className="rounded-xl border-2 hidden dark:block border-muted shadow-2xl"
          />
        </div>
      </section>
      <section className="flex justify-center items-center flex-col gap-4 px-8 mb-20 mt-15 md:mt-20!">
        <h2 className="text-4xl text-center font-semibold dark:text-white text-gray-900">
          Choose what fits you right
        </h2>
        <p className="dark:text-muted-foreground text-gray-600 text-center max-w-2xl px-4">
          Our straightforward pricing plans are tailored to meet your needs. If
          {"you're"} not ready to commit you can get started for free.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mt-12 max-w-300">
          {PRICING.map((card) => (
            <PricingCard key={card.title} {...card} />
          ))}
        </div>
      </section>
    </>
  );
}


