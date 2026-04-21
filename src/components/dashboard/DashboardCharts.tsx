'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface BarItem {
  industry: string;
  score: number;
  count: number;
}

interface PieItem {
  name: string;
  value: number;
  color: string;
}

interface LineItem {
  week: string;
  assessments: number;
}

interface RadarItem {
  category: string;
  score: number;
  fullMark: number;
}

interface DashboardChartsProps {
  barData: BarItem[];
  pieData: PieItem[];
  lineData: LineItem[];
  radarData: RadarItem[];
}

export function DashboardCharts({
  barData,
  pieData,
  lineData,
  radarData,
}: DashboardChartsProps) {
  return (
    <section className='grid gap-6 xl:grid-cols-2'>
      {/* BarChart: Average score by industry */}
      <Card>
        <CardHeader>
          <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-50'>
            Average score by industry
          </h2>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            Cloud readiness scores grouped by organization industry
          </p>
        </CardHeader>
        <CardContent>
          {barData.length ? (
            <ResponsiveContainer
              width='100%'
              height={300}>
              <BarChart data={barData}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  className='stroke-slate-200 dark:stroke-slate-800'
                />
                <XAxis
                  dataKey='industry'
                  tick={{ fontSize: 12 }}
                  className='fill-slate-600 dark:fill-slate-400'
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  className='fill-slate-600 dark:fill-slate-400'
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                />
                <Bar
                  dataKey='score'
                  name='Avg Score'
                  radius={[6, 6, 0, 0]}>
                  {barData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={
                        [
                          '#0ea5e9',
                          '#06b6d4',
                          '#14b8a6',
                          '#10b981',
                          '#22c55e',
                          '#84cc16',
                          '#eab308',
                          '#f59e0b',
                          '#f97316',
                          '#ef4444',
                        ][index % 10]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className='py-12 text-center text-sm text-slate-500'>
              No assessment data available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* PieChart: Risk distribution */}
      <Card>
        <CardHeader>
          <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-50'>
            Readiness distribution
          </h2>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            Assessment outcomes by readiness status
          </p>
        </CardHeader>
        <CardContent>
          {pieData.length ? (
            <ResponsiveContainer
              width='100%'
              height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx='50%'
                  cy='50%'
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey='value'
                  nameKey='name'
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}>
                  {pieData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.color}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className='py-12 text-center text-sm text-slate-500'>
              No assessment data available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* LineChart: Assessments per week */}
      <Card>
        <CardHeader>
          <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-50'>
            Weekly assessments
          </h2>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            Assessments conducted over the last 8 weeks
          </p>
        </CardHeader>
        <CardContent>
          {lineData.length ? (
            <ResponsiveContainer
              width='100%'
              height={300}>
              <LineChart data={lineData}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  className='stroke-slate-200 dark:stroke-slate-800'
                />
                <XAxis
                  dataKey='week'
                  tick={{ fontSize: 12 }}
                  className='fill-slate-600 dark:fill-slate-400'
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  className='fill-slate-600 dark:fill-slate-400'
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                />
                <Line
                  type='monotone'
                  dataKey='assessments'
                  name='Assessments'
                  stroke='#0ea5e9'
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0ea5e9' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className='py-12 text-center text-sm text-slate-500'>
              No recent assessment data.
            </p>
          )}
        </CardContent>
      </Card>

      {/* RadarChart: Category averages */}
      <Card>
        <CardHeader>
          <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-50'>
            Category readiness
          </h2>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            Average scores across the 6 assessment categories
          </p>
        </CardHeader>
        <CardContent>
          {radarData.length ? (
            <ResponsiveContainer
              width='100%'
              height={300}>
              <RadarChart data={radarData}>
                <PolarGrid className='stroke-slate-200 dark:stroke-slate-700' />
                <PolarAngleAxis
                  dataKey='category'
                  tick={{ fontSize: 11 }}
                  className='fill-slate-600 dark:fill-slate-400'
                />
                <PolarRadiusAxis
                  domain={[0, 5]}
                  tick={{ fontSize: 10 }}
                  className='fill-slate-400'
                />
                <Radar
                  name='Avg Score'
                  dataKey='score'
                  stroke='#8b5cf6'
                  fill='#8b5cf6'
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <p className='py-12 text-center text-sm text-slate-500'>
              No category data available.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
