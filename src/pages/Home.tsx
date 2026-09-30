import { FlameIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { COURSES, unitsOf } from '@/content'
import { currentStreak, localDate } from '@/learning/streak'
import { useAppState } from '@/store'

export default function Home() {
  const { progress, streak } = useAppState()
  const days = currentStreak(streak, localDate())
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">コース</h1>
        <Badge variant={days > 0 ? 'default' : 'outline'}>
          <FlameIcon data-icon="inline-start" />
          {days} 日連続
        </Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {COURSES.map((c) => {
          const units = unitsOf(c.id)
          const passed = units.filter((u) => progress[u.id]?.passed).length
          return (
            <Link key={c.id} to={`/course/${c.id}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle>{c.title}</CardTitle>
                  <CardDescription>{c.description}</CardDescription>
                  <p className="text-muted-foreground text-xs">
                    {units.length === 0 ? '準備中' : `${passed} / ${units.length} 単元 合格`}
                  </p>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
