'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Modal, ModalFooter } from '@/components/ui/modal'
import { Label } from '@/components/ui/label'
import {
  Plus,
  Upload,
  Download,
  Search,
  MoreHorizontal,
  Users,
  UserPlus,
  Trash2,
  Edit,
} from 'lucide-react'
import { formatPhoneNumber, formatDate } from '@/lib/utils'

// 샘플 데이터
const sampleContacts = [
  {
    id: '1',
    name: '김철수',
    phone: '01012345678',
    email: 'kim@example.com',
    company: '테크컴퍼니',
    groups: ['VIP', '신규고객'],
    optInStatus: true,
    createdAt: '2024-11-01',
  },
  {
    id: '2',
    name: '이영희',
    phone: '01087654321',
    email: 'lee@example.com',
    company: '디자인스튜디오',
    groups: ['일반'],
    optInStatus: true,
    createdAt: '2024-11-05',
  },
  {
    id: '3',
    name: '박민수',
    phone: '01011112222',
    email: 'park@example.com',
    company: '',
    groups: ['VIP'],
    optInStatus: false,
    createdAt: '2024-11-10',
  },
]

const sampleGroups = [
  { id: '1', name: 'VIP', count: 152, color: 'bg-purple-500' },
  { id: '2', name: '신규고객', count: 89, color: 'bg-blue-500' },
  { id: '3', name: '일반', count: 543, color: 'bg-gray-500' },
  { id: '4', name: '휴면고객', count: 234, color: 'bg-yellow-500' },
]

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])

  const filteredContacts = sampleContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">연락처 관리</h1>
          <p className="text-muted-foreground">고객 연락처를 관리하고 그룹화하세요</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            가져오기
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            내보내기
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            연락처 추가
          </Button>
        </div>
      </div>

      {/* Groups */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sampleGroups.map((group) => (
          <Card key={group.id} className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`h-10 w-10 rounded-full ${group.color} flex items-center justify-center`}>
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">{group.name}</p>
                <p className="text-sm text-muted-foreground">{group.count}명</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>전체 연락처</CardTitle>
              <CardDescription>총 {sampleContacts.length}명의 연락처가 있습니다</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="이름, 전화번호, 이메일 검색"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedContacts(sampleContacts.map((c) => c.id))
                      } else {
                        setSelectedContacts([])
                      }
                    }}
                  />
                </TableHead>
                <TableHead>이름</TableHead>
                <TableHead>전화번호</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>그룹</TableHead>
                <TableHead>수신동의</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedContacts([...selectedContacts, contact.id])
                        } else {
                          setSelectedContacts(selectedContacts.filter((id) => id !== contact.id))
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{formatPhoneNumber(contact.phone)}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {contact.groups.map((group) => (
                        <Badge key={group} variant="secondary" className="text-xs">
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={contact.optInStatus ? 'success' : 'destructive'}>
                      {contact.optInStatus ? '동의' : '거부'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(contact.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Contact Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="연락처 추가"
        description="새로운 연락처를 추가합니다"
      >
        <form className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
              <Input id="name" placeholder="홍길동" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">전화번호 *</Label>
              <Input id="phone" placeholder="010-1234-5678" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" placeholder="email@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">회사명</Label>
            <Input id="company" placeholder="회사명" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="optIn" className="rounded border-gray-300" defaultChecked />
            <Label htmlFor="optIn">광고성 메시지 수신 동의</Label>
          </div>
        </form>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
            취소
          </Button>
          <Button onClick={() => setIsAddModalOpen(false)}>
            <UserPlus className="mr-2 h-4 w-4" />
            추가
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
