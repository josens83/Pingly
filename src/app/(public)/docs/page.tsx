'use client'

/**
 * API Documentation Page
 * Interactive API documentation with Swagger UI
 */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@/components/primitives'
import { Book, Code, Lock, Zap, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface PathInfo {
  method: string
  path: string
  summary: string
  description: string
  tags: string[]
  operationId: string
  security?: Array<Record<string, string[]>>
  parameters?: Array<{
    name: string
    in: string
    required?: boolean
    schema: { type: string; default?: unknown; enum?: string[] }
    description?: string
  }>
  requestBody?: {
    required: boolean
    content: {
      'application/json': {
        schema: { $ref?: string }
      }
    }
  }
  responses: Record<string, {
    description: string
    content?: {
      'application/json': {
        schema: { $ref?: string }
      }
    }
  }>
}

interface OpenApiSpec {
  info: {
    title: string
    version: string
    description: string
  }
  servers: Array<{
    url: string
    description: string
  }>
  tags: Array<{
    name: string
    description: string
  }>
  paths: Record<string, Record<string, PathInfo>>
  components: {
    schemas: Record<string, unknown>
  }
}

const methodColors: Record<string, string> = {
  get: 'bg-blue-500',
  post: 'bg-green-500',
  put: 'bg-orange-500',
  patch: 'bg-yellow-500',
  delete: 'bg-red-500',
}

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<OpenApiSpec | null>(null)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [activeTag, setActiveTag] = useState<string>('all')

  useEffect(() => {
    fetch('/api/docs')
      .then((res) => res.json())
      .then((data) => setSpec(data))
      .catch(console.error)
  }, [])

  const togglePath = (pathKey: string) => {
    const newExpanded = new Set(expandedPaths)
    if (newExpanded.has(pathKey)) {
      newExpanded.delete(pathKey)
    } else {
      newExpanded.add(pathKey)
    }
    setExpandedPaths(newExpanded)
  }

  const getEndpoints = (): Array<{ path: string; method: string; info: PathInfo }> => {
    if (!spec) return []

    const endpoints: Array<{ path: string; method: string; info: PathInfo }> = []

    Object.entries(spec.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, info]) => {
        if (activeTag === 'all' || info.tags?.includes(activeTag)) {
          endpoints.push({ path, method, info })
        }
      })
    })

    return endpoints
  }

  if (!spec) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pingly-50 via-white to-violet-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-pingly-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pingly-50 via-white to-violet-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-pingly-500 to-violet-500">
                <Book className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{spec.info.title}</h1>
                <p className="text-sm text-muted-foreground">v{spec.info.version}</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="text-sm text-pingly-600 hover:text-pingly-700 flex items-center gap-1"
            >
              대시보드로 이동 <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-base">API 카테고리</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1 p-4">
                  <button
                    onClick={() => setActiveTag('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeTag === 'all'
                        ? 'bg-pingly-100 text-pingly-700'
                        : 'hover:bg-muted'
                    }`}
                  >
                    전체 보기
                  </button>
                  {spec.tags.map((tag) => (
                    <button
                      key={tag.name}
                      onClick={() => setActiveTag(tag.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        activeTag === tag.name
                          ? 'bg-pingly-100 text-pingly-700'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="font-medium capitalize">{tag.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {tag.description}
                      </div>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">빠른 시작</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Lock className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">인증</p>
                    <p className="text-xs text-muted-foreground">
                      Bearer 토큰 사용
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Code className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">응답 형식</p>
                    <p className="text-xs text-muted-foreground">
                      JSON (application/json)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Rate Limit</p>
                    <p className="text-xs text-muted-foreground">
                      1000 요청/분
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.aside>

          {/* Main Content */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3 space-y-4"
          >
            {/* Server Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">서버</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {spec.servers.map((server, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <code className="text-sm">{server.url}</code>
                      <Badge variant="outline">{server.description}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Endpoints */}
            {getEndpoints().map(({ path, method, info }, index) => {
              const pathKey = `${method}-${path}`
              const isExpanded = expandedPaths.has(pathKey)

              return (
                <motion.div
                  key={pathKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden">
                    <button
                      onClick={() => togglePath(pathKey)}
                      className="w-full text-left"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`${methodColors[method]} text-white uppercase text-xs`}
                          >
                            {method}
                          </Badge>
                          <code className="text-sm font-mono">{path}</code>
                          {info.security && (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div className="ml-auto">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {info.summary}
                        </p>
                      </CardHeader>
                    </button>

                    {isExpanded && (
                      <CardContent className="border-t pt-4">
                        {info.description && (
                          <p className="text-sm mb-4">{info.description}</p>
                        )}

                        {/* Parameters */}
                        {info.parameters && info.parameters.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-2">파라미터</h4>
                            <div className="space-y-2">
                              {info.parameters.map((param) => (
                                <div
                                  key={param.name}
                                  className="p-3 bg-muted rounded-lg"
                                >
                                  <div className="flex items-center gap-2">
                                    <code className="text-sm font-medium">
                                      {param.name}
                                    </code>
                                    <Badge variant="outline" className="text-xs">
                                      {param.in}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {param.schema.type}
                                    </Badge>
                                    {param.required && (
                                      <Badge variant="destructive" className="text-xs">
                                        필수
                                      </Badge>
                                    )}
                                  </div>
                                  {param.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {param.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Responses */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">응답</h4>
                          <div className="space-y-2">
                            {Object.entries(info.responses).map(([code, response]) => (
                              <div
                                key={code}
                                className="p-3 bg-muted rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={code.startsWith('2') ? 'default' : 'destructive'}
                                    className="text-xs"
                                  >
                                    {code}
                                  </Badge>
                                  <span className="text-sm">{response.description}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              )
            })}
          </motion.main>
        </div>
      </div>
    </div>
  )
}
