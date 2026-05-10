import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface TabContent {
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  imageSrc: string;
  imageAlt: string;
}

interface Tab {
  value: string;
  icon: ReactNode;
  label: string;
  content: TabContent;
}

interface Feature108Props {
  badge?: string;
  heading?: string;
  description?: string;
  tabs?: Tab[];
}

const Feature108 = ({
  badge = "AMO SecurePay",
  heading = "Banking Intelligence, Redefined for Nigeria",
  description = "Three pillars that make AMO the most trusted payment infrastructure in West Africa.",
  tabs = [],
}: Feature108Props) => {
  return (
    <section className="py-32 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge variant="outline" className="border-orange-500/50 text-orange-600 dark:text-orange-400">{badge}</Badge>
          <h1 className="max-w-2xl text-3xl font-semibold md:text-4xl">{heading}</h1>
          <p className="text-muted-foreground max-w-xl">{description}</p>
        </div>
        <Tabs defaultValue={tabs[0]?.value} className="mt-8">
          <TabsList className="container flex flex-col items-center justify-center gap-4 sm:flex-row md:gap-10">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all"
              >
                {tab.icon} {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mx-auto mt-8 max-w-screen-xl rounded-2xl bg-background border p-6 lg:p-16">
            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="grid place-items-center gap-20 lg:grid-cols-2 lg:gap-10">
                <div className="flex flex-col gap-5">
                  <Badge variant="outline" className="w-fit border-orange-500/50 text-orange-600 dark:text-orange-400">{tab.content.badge}</Badge>
                  <h3 className="text-3xl font-semibold lg:text-5xl">{tab.content.title}</h3>
                  <p className="text-muted-foreground lg:text-lg">{tab.content.description}</p>
                  <Button className="mt-2.5 w-fit gap-2 bg-orange-500 hover:bg-orange-600 text-white" size="lg">{tab.content.buttonText}</Button>
                </div>
                <img src={tab.content.imageSrc} alt={tab.content.imageAlt} className="rounded-xl w-full object-cover" />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
};

export { Feature108 };
