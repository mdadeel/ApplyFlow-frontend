import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { MetricCard } from '../components/features/MetricCard'
import { Card } from '../components/ui/Card'
import { ProgressCircle } from '../components/ui/ProgressCircle'
import { Skeleton } from '../components/ui/Skeleton'
import { analyticsService, type ChartDataResponse } from '../services/analytics'
import type { AnalyticsSummary } from '../types'
import {
  Briefcase,
  BarChart3,
  Target,
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Lightbulb,
  ChevronRight,
} from '../lib/icons'

const CHART_HEIGHT = 320
const CHART_PADDING = { top: 20, right: 24, bottom: 32, left: 16 }

interface AreaChartProps {
  data: ChartDataResponse['appsOverTime']
  maxValue: number
}

function AreaChart({ data, maxValue }: AreaChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width)
    })
    observer.observe(el)
    setWidth(el.clientWidth)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (width === 0) return <div ref={containerRef} className="w-full" style={{ height: CHART_HEIGHT }} />

  const drawWidth = width - CHART_PADDING.left - CHART_PADDING.right
  const drawHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom
  const stepX = data.length > 1 ? drawWidth / (data.length - 1) : drawWidth

  const points = data.map((p, i) => ({
    x: CHART_PADDING.left + i * stepX,
    y: CHART_PADDING.top + drawHeight - (p.applications / maxValue) * drawHeight,
    ...p,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${points[points.length - 1].x},${CHART_PADDING.top + drawHeight} L${points[0].x},${CHART_PADDING.top + drawHeight} Z`

  const pathLength = 600

  return (
    <div ref={containerRef} className="w-full" style={{ height: CHART_HEIGHT }}>
      <svg
        width={width}
        height={CHART_HEIGHT}
        className="overflow-visible"
        aria-label="Applications over time chart"
        role="img"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#2563eb" stopOpacity={0.01} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = CHART_PADDING.top + drawHeight * (1 - frac)
          return (
            <g key={frac}>
              <line
                x1={CHART_PADDING.left}
                y1={y}
                x2={width - CHART_PADDING.right}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth={1}
              />
              <text
                x={CHART_PADDING.left - 6}
                y={y + 4}
                textAnchor="end"
                className="fill-text-tertiary text-[10px] font-semibold"
              >
                {Math.round(maxValue * frac)}
              </text>
            </g>
          )
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGradient)" className="transition-opacity duration-500" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#2563eb"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLength}
          strokeDashoffset={animated ? 0 : pathLength}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />

        {/* Data dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hoveredIndex === i ? 5 : 3.5}
            fill="#2563eb"
            stroke="white"
            strokeWidth={2}
            className="transition-all duration-150 cursor-pointer"
            style={{ opacity: animated ? 1 : 0, transitionDelay: `${i * 30}ms` }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}

        {/* X-axis labels */}
        {points.filter((_, i) => i % Math.max(1, Math.floor(points.length / 7)) === 0 || i === points.length - 1).map((p) => (
          <text
            key={p.date}
            x={p.x}
            y={CHART_HEIGHT - 6}
            textAnchor="middle"
            className="fill-on-surface-variant text-[11px]"
          >
            {p.date.slice(5)}
          </text>
        ))}

        {/* Tooltip */}
        {hoveredIndex !== null && (
          <g className="animate-fadeIn">
            <rect
              x={points[hoveredIndex].x - 36}
              y={points[hoveredIndex].y - 44}
              width={72}
              height={30}
              rx={6}
              fill="#1e293b"
            />
            <text
              x={points[hoveredIndex].x}
              y={points[hoveredIndex].y - 24}
              textAnchor="middle"
              fill="white"
              className="text-[12px] font-medium"
            >
              {points[hoveredIndex].applications} app{points[hoveredIndex].applications === 1 ? '' : 's'}
            </text>
            <text
              x={points[hoveredIndex].x}
              y={points[hoveredIndex].y - 40}
              textAnchor="middle"
              fill="#94a3b8"
              className="text-[10px]"
            >
              {points[hoveredIndex].date}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

export function AnalyticsPage() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [chartData, setChartData] = useState<ChartDataResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryData, chart] = await Promise.all([
          analyticsService.getAnalyticsSummary(),
          analyticsService.getChartData(),
        ])
        setSummary(summaryData)
        setChartData(chart)
      } catch {
        setSummary(null)
        setChartData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalApps = summary?.totalApps ?? 0
  const interviewRate = summary?.interviewRate ?? 0
  const offerRate = summary?.offerRate ?? 0
  const avgMatchScore = summary?.avgMatchScore ?? null
  const hasApplications = totalApps > 0

  const statusDistribution = [
    { label: 'Applied', count: summary?.byStatus?.applied ?? 0, color: 'bg-blue-500' },
    { label: 'Interview', count: summary?.byStatus?.interview ?? 0, color: 'bg-amber-500' },
    { label: 'Offer', count: summary?.byStatus?.offer ?? 0, color: 'bg-emerald-500' },
    { label: 'Rejected', count: summary?.byStatus?.rejected ?? 0, color: 'bg-red-500' },
  ]

  const total = statusDistribution.reduce((sum, s) => sum + s.count, 0) || 1
  const appsOverTime = chartData?.appsOverTime ?? []
  const maxAppsInDay = appsOverTime.reduce((m, p) => Math.max(m, p.applications), 0) || 1

  const matchScoreDisplay = loading
    ? '-'
    : avgMatchScore === null
    ? 'N/A'
    : `${avgMatchScore}%`

  return (
    <AppLayout>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
        <MetricCard
          title="Total Applications"
          value={loading ? '-' : totalApps}
          subtitle="All time"
          icon={Briefcase}
          color="info"
        />
        <MetricCard
          title="Interview Rate"
          value={loading ? '-' : `${interviewRate}%`}
          subtitle="Applications to interview"
          icon={Target}
          color="warning"
        />
        <MetricCard
          title="Offer Rate"
          value={loading ? '-' : `${offerRate}%`}
          subtitle="Interviews to offer"
          icon={TrendingUp}
          color="success"
        />
        <MetricCard
          title="Avg Match Score"
          value={matchScoreDisplay}
          subtitle={avgMatchScore === null ? 'No scored applications yet' : 'AI-powered analysis'}
          icon={BarChart3}
          color="primary"
        />
      </div>

      {!loading && !hasApplications ? (
        <Card className="mb-xl">
          <div className="py-xl text-center">
            <Briefcase className="h-12 w-12 text-text-tertiary mx-auto mb-md opacity-50" />
            <h3 className="text-heading-2 text-text-primary mb-2">No applications yet</h3>
            <p className="text-body text-text-secondary">
              Start tracking applications to see analytics.
            </p>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-xl">
        <Card>
          <h3 className="text-heading-2 text-text-primary mb-md">Applications by Status</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton variant="text" width="100px" />
                  <Skeleton variant="text" width="100%" height={8} />
                  <Skeleton variant="text" width="40px" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-md">
              {statusDistribution.map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-body text-text-primary">{item.label}</span>
                    <span className="text-label text-text-tertiary">{item.count}</span>
                  </div>
                    <div className="w-full bg-surface-secondary rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                      style={{ width: `${(item.count / total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-heading-2 text-text-primary mb-md">Conversion Metrics</h3>
          {loading ? (
            <div className="flex items-center justify-center py-xl">
              <Skeleton variant="circular" width={120} height={120} />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-lg">
              <div className="flex items-center gap-xl">
                <div className="text-center">
                  <ProgressCircle value={interviewRate} size={100} strokeWidth={8} color="warning" />
                  <p className="text-label text-text-tertiary mt-2">Interview Rate</p>
                </div>
                <div className="text-center">
                  <ProgressCircle value={offerRate} size={100} strokeWidth={8} color="success" />
                  <p className="text-label text-text-tertiary mt-2">Offer Rate</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full mt-4">
                <div className="flex items-center gap-3.5 p-4 rounded-xl bg-surface-secondary border border-border">
                  <FileText className="h-5 w-5 text-text-tertiary" />
                  <div>
                    <p className="text-caption text-text-secondary font-medium">Applied</p>
                    <p className="text-heading-3 font-bold text-text-primary">{summary?.byStatus?.applied ?? 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 p-4 rounded-xl bg-surface-secondary border border-border">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-caption text-text-secondary font-medium">Offers</p>
                    <p className="text-heading-3 font-bold text-text-primary">{summary?.byStatus?.offer ?? 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 p-4 rounded-xl bg-surface-secondary border border-border">
                  <Clock className="h-5 w-5 text-warning" />
                  <div>
                    <p className="text-caption text-text-secondary font-medium">In Progress</p>
                    <p className="text-heading-3 font-bold text-text-primary">{summary?.byStatus?.interview ?? 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 p-4 rounded-xl bg-surface-secondary border border-border">
                  <XCircle className="h-5 w-5 text-danger" />
                  <div>
                    <p className="text-caption text-text-secondary font-medium">Rejected</p>
                    <p className="text-heading-3 font-bold text-text-primary">{summary?.byStatus?.rejected ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card className="mb-xl">
        <h3 className="text-heading-2 text-text-primary mb-md">Applications Over Time</h3>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton variant="text" width="100px" />
                <Skeleton variant="text" width="100%" height={12} />
                <Skeleton variant="text" width="40px" />
              </div>
            ))}
          </div>
        ) : appsOverTime.length === 0 ? (
          <p className="text-body text-text-secondary py-md text-center">
            No applications tracked yet.
          </p>
        ) : (
          <AreaChart data={appsOverTime} maxValue={maxAppsInDay} />
        )}
      </Card>

      <Card className="hover:border-primary/50 transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-warning/10 rounded-xl text-warning shrink-0">
              <Lightbulb className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-heading-2 text-text-primary font-semibold">AI Insights & Recommendations</h3>
              <p className="text-body text-text-secondary mt-1">
                Unlock personalized, actionable strategies based on your applications, conversion rates, and match scores.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/insights')}
            className="text-label text-primary hover:underline flex items-center gap-1 self-start sm:self-center bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-xl transition-all font-medium border border-primary/20 shrink-0"
          >
            View All Insights
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </Card>
    </AppLayout>
  )
}
