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
        "flex flex-col justify-between w-full md:w-[350px] min-h-[400px] bg-[#05070a] border-muted",
        {
          "border-2 border-primary": title === "Unlimited Saas",
        }
      )}
    >
      <CardHeader>
        <CardTitle
          className={cn("text-2xl", {
            "text-muted-foreground": title !== "Unlimited Saas",
          })}
        >
          {title}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-bold">{price}</span>
          <span className="text-muted-foreground text-sm">/m</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-6">
        <div className="flex flex-col gap-3">
          {features.map((feature) => (
            <div key={feature} className="flex gap-2 items-center">
              <Check className="text-muted-foreground h-5 w-5" />
              <p className="text-sm text-muted-foreground">{feature}</p>
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
              "bg-muted-foreground/20 text-white hover:bg-muted-foreground/30":
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
        bg-[linear-gradient(to_right,#c4c2c2_1px,transparent_1px),linear-gradient(to_bottom,#c4c2c2_1px,transparent_1px)]
        bg-[size:1rem_1rem]
        [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]
      "
        />

        <p className="text-center text-lg mb-4 text-muted-foreground">
          Run your agency, in one place
        </p>

        <h1
          className="
        text-center
        font-bold
        text-7xl
        md:text-[200px]
        bg-gradient-to-r from-primary to-secondary-foreground
        text-transparent bg-clip-text
        leading-tight
      "
        >
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
      <section className="flex justify-center items-center flex-col gap-4 mt-20 px-8 mb-20 md:!mt-20 mt-[60px]">
        <h2 className="text-4xl text-center font-semibold">
          Choose what fits you right
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl px-4">
          Our straightforward pricing plans are tailored to meet your needs. If
          {"you're"} not ready to commit you can get started for free.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mt-12 max-w-[1200px]">
          {PRICING.map((card) => (
            <PricingCard key={card.title} {...card} />
          ))}
        </div>
      </section>
    </>
  );
}


