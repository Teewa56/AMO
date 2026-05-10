import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function Features10() {
  return (
    <section className="bg-zinc-50 py-16 md:py-32 dark:bg-transparent">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-5xl">
        <div className="mx-auto grid gap-4 lg:grid-cols-2">
          <FeatureCard>
            <CardHeader className="pb-3">
              <CardHeading
                icon={ShieldIcon}
                title="AI Fraud Shield"
                description="Every transaction scanned in 1.2 seconds. Zero compromise on security."
              />
            </CardHeader>
            <div className="relative mb-6 border-t border-dashed sm:mb-0">
              <div className="absolute inset-0 [background:radial-gradient(125%_125%_at_50%_0%,transparent_40%,hsl(var(--muted)),hsl(var(--background))_125%)]"></div>
              <div className="aspect-[76/59] p-1 px-6">
                <img
                  src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1207&h=929&fit=crop"
                  alt="AI Security visualization"
                  className="w-full h-full object-cover rounded-lg opacity-80"
                />
              </div>
            </div>
          </FeatureCard>

          <FeatureCard>
            <CardHeader className="pb-3">
              <CardHeading
                icon={ActivityIcon}
                title="Real-Time Transfers"
                description="Squad-powered NGN transfers settle in under 3 seconds across all Nigerian banks."
              />
            </CardHeader>
            <CardContent>
              <div className="relative mb-6 sm:mb-0">
                <div className="absolute -inset-6 [background:radial-gradient(50%_50%_at_75%_50%,transparent,hsl(var(--background))_100%)]"></div>
                <div className="aspect-[76/59] border rounded overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1207&h=929&fit=crop"
                    alt="Transfer analytics"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </CardContent>
          </FeatureCard>

          <FeatureCard className="p-6 lg:col-span-2">
            <p className="mx-auto my-6 max-w-md text-balance text-center text-2xl font-semibold">
              Full transaction visibility with risk scores on every payment.
            </p>
            <div className="flex justify-center gap-6 overflow-hidden">
              <CircularUI label="Safe" circles={[{ pattern: 'border' }, { pattern: 'border' }]} />
              <CircularUI label="Scanning" circles={[{ pattern: 'none' }, { pattern: 'primary' }]} />
              <CircularUI label="Flagged" circles={[{ pattern: 'blue' }, { pattern: 'none' }]} />
              <CircularUI label="Blocked" circles={[{ pattern: 'primary' }, { pattern: 'none' }]} className="hidden sm:block" />
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  )
}

/* ── Local icon components ── */
function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
function ActivityIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline strokeLinecap="round" strokeLinejoin="round" points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

interface FeatureCardProps { children: ReactNode; className?: string }
const FeatureCard = ({ children, className }: FeatureCardProps) => (
  <Card className={cn('group relative rounded-none shadow-zinc-950/5', className)}>
    <CardDecorator />
    {children}
  </Card>
)
const CardDecorator = () => (
  <>
    <span className="border-orange-500 absolute -left-px -top-px block size-2 border-l-2 border-t-2"></span>
    <span className="border-orange-500 absolute -right-px -top-px block size-2 border-r-2 border-t-2"></span>
    <span className="border-orange-500 absolute -bottom-px -left-px block size-2 border-b-2 border-l-2"></span>
    <span className="border-orange-500 absolute -bottom-px -right-px block size-2 border-b-2 border-r-2"></span>
  </>
)

interface CardHeadingProps { icon: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>; title: string; description: string }
const CardHeading = ({ icon: Icon, title, description }: CardHeadingProps) => (
  <div className="p-6">
    <span className="text-muted-foreground flex items-center gap-2">
      <Icon className="size-4 text-orange-500" />{title}
    </span>
    <p className="mt-8 text-2xl font-semibold">{description}</p>
  </div>
)

interface CircleConfig { pattern: 'none' | 'border' | 'primary' | 'blue' }
interface CircularUIProps { label: string; circles: CircleConfig[]; className?: string }
const CircularUI = ({ label, circles, className }: CircularUIProps) => (
  <div className={className}>
    <div className="bg-gradient-to-b from-border size-fit rounded-2xl to-transparent p-px">
      <div className="bg-gradient-to-b from-background to-muted/25 relative flex aspect-square w-fit items-center -space-x-4 rounded-[15px] p-4">
        {circles.map((circle, i) => (
          <div key={i} className={cn('size-7 rounded-full border sm:size-8', {
            'border-orange-500': circle.pattern === 'none',
            'border-orange-500 bg-[repeating-linear-gradient(-45deg,hsl(var(--border)),hsl(var(--border))_1px,transparent_1px,transparent_4px)]': circle.pattern === 'border',
            'border-orange-500 bg-background bg-[repeating-linear-gradient(-45deg,theme(colors.orange.500),theme(colors.orange.500)_1px,transparent_1px,transparent_4px)]': circle.pattern === 'primary',
            'bg-background z-1 border-blue-500 bg-[repeating-linear-gradient(-45deg,theme(colors.blue.500),theme(colors.blue.500)_1px,transparent_1px,transparent_4px)]': circle.pattern === 'blue',
          })} />
        ))}
      </div>
    </div>
    <span className="text-muted-foreground mt-1.5 block text-center text-sm">{label}</span>
  </div>
)
