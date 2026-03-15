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
        "flex flex-col justify-between w-full md:w-87.5 min-h-100 dark:bg-coffee-espresso/80 bg-white border-2",
        {
          "border-primary shadow-coffee-glow": title === "Unlimited Saas",
          "dark:border-coffee-mocha/50 border-coffee-latte/30": title !== "Unlimited Saas",
        }
      )}
    >
      <CardHeader>
        <CardTitle
          className={cn("text-2xl font-heading", {
            "dark:text-coffee-cream text-coffee-espresso": title === "Unlimited Saas",
            "dark:text-coffee-latte text-coffee-mocha": title !== "Unlimited Saas",
          })}
        >
          {title}
        </CardTitle>
        <CardDescription className="dark:text-coffee-latte/70 text-coffee-brown/70">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-bold font-heading dark:text-coffee-cream text-coffee-espresso">{price}</span>
          <span className="dark:text-coffee-latte/60 text-coffee-brown/60 text-sm">/m</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-6">
        <div className="flex flex-col gap-3">
          {features.map((feature) => (
            <div key={feature} className="flex gap-2 items-center">
              <Check className="dark:text-coffee-latte text-primary h-5 w-5" />
              <p className="text-sm dark:text-coffee-latte/80 text-coffee-brown/80">{feature}</p>
            </div>
          ))}
        </div>
        <Link
          href={`/agency?plan=${priceId}`}
          className={cn(
            "w-full text-center p-2 rounded-md font-semibold transition-all",
            {
              "bg-primary text-primary-foreground hover:bg-primary/90 shadow-coffee-glow":
                title === "Unlimited Saas",
              "dark:bg-coffee-mocha/40 bg-coffee-cream dark:text-coffee-cream text-coffee-espresso dark:hover:bg-coffee-mocha/60 hover:bg-coffee-latte/60":
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
        {/* Background grid — warm coffee-toned */}
        <div
          className="absolute inset-0 -z-10
        dark:bg-[linear-gradient(to_right,#2A1F17_1px,transparent_1px),linear-gradient(to_bottom,#2A1F17_1px,transparent_1px)]
        bg-[linear-gradient(to_right,#E8D5BC_1px,transparent_1px),linear-gradient(to_bottom,#E8D5BC_1px,transparent_1px)]
        bg-size-[1rem_1rem]
        mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]
      "
        />

        <p className="text-center text-lg mb-4 dark:text-coffee-latte text-coffee-brown font-medium">
          Run your agency, in one place
        </p>

        <h1
          className="
        text-center
        font-bold
        text-7xl
        md:text-[200px]
        bg-linear-to-r from-primary to-secondary-foreground
        dark:from-coffee-brown dark:to-coffee-latte
        text-transparent bg-clip-text
        leading-tight
        relative
        z-0
        font-heading
      "
        >
          Flowza
        </h1>
        <div className="flex justify-center items-center relative md:-mt-10 px-4 z-10">
          <Image
            src="/assets/coffee-dashboard-light.png"
            alt="Flowza Dashboard Preview"
            width={1200}
            height={1200}
            priority
            unoptimized
            className="rounded-t-[2rem] rounded-b-[1rem] border-2 dark:hidden border-coffee-latte/30 shadow-coffee-glow-lg object-cover object-top aspect-[16/10] w-[1200px]"
          />
          <Image
            src="/assets/coffee-dashboard-dark.png"
            alt="Flowza Dashboard Preview"
            width={1200}
            height={1200}
            priority
            unoptimized
            className="rounded-t-[2rem] rounded-b-[1rem] border-2 hidden dark:block border-coffee-mocha/50 shadow-coffee-glow-lg object-cover object-top aspect-[16/10] w-[1200px]"
          />
        </div>
      </section>
      <section className="flex justify-center items-center flex-col gap-4 px-8 mb-20 mt-15 md:mt-20!">
        <h2 className="text-4xl text-center font-semibold font-heading dark:text-coffee-cream text-coffee-espresso">
          Choose what fits you right
        </h2>
        <p className="dark:text-coffee-latte/70 text-coffee-brown/70 text-center max-w-2xl px-4">
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
