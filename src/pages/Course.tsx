import { CheckIcon, LockIcon } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { COURSES, UNITS, unitsOf } from '@/content'
import { unlockedUnits } from '@/learning/progress'
import { useAppState } from '@/store'
import { t } from '@/i18n'

export default function Course() {
  const { courseId = '' } = useParams()
  const { progress } = useAppState()
  const course = COURSES.find((c) => c.id === courseId)
  if (!course) return <p>{t('course.notFound')}</p>
  const unlocked = unlockedUnits(UNITS, progress)
  const units = unitsOf(courseId)
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{course.title}</h1>
      {units.length === 0 && <p className="text-muted-foreground">{t('course.preparing')}</p>}
      <div className="flex flex-col gap-3">
        {units.map((u) => {
          const open = unlocked.has(u.id)
          const p = progress[u.id]
          const card = (
            <Card className={'transition-colors hover:bg-muted/50' + (open ? '' : ' opacity-60')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {u.title}
                  {p?.passed && (
                    <Badge>
                      <CheckIcon data-icon="inline-start" />
                      {t('course.passed')}
                    </Badge>
                  )}
                  {!open && (
                    <Badge variant="outline">
                      <LockIcon data-icon="inline-start" />
                      {t('course.prevNotPassed')}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{u.summary}</CardDescription>
                {p && <p className="text-muted-foreground text-xs">{t('course.stats', { best: p.best, attempts: p.attempts })}</p>}
              </CardHeader>
            </Card>
          )
          return (
            <Link key={u.id} to={`/course/${u.course}/${u.slug}`}>
              {card}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
