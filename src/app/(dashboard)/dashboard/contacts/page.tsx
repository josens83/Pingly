'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card,
  Button,
  Badge,
  Input,
  Checkbox,
  Avatar,
  AvatarFallback,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TablePagination,
  TableEmpty,
} from '@/components/primitives'
import { EmptyState } from '@/components/patterns'
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
  Check,
  X,
  Mail,
  Phone,
  Building,
  Filter,
  ChevronDown,
  Star,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
}

// Sample data
const sampleContacts = [
  {
    id: '1',
    name: '김철수',
    phone: '010-1234-5678',
    email: 'kim@example.com',
    company: '테크컴퍼니',
    groups: ['VIP', '신규고객'],
    optInStatus: true,
    lastContact: '2024-11-20',
    messageCount: 12,
    createdAt: '2024-11-01',
  },
  {
    id: '2',
    name: '이영희',
    phone: '010-8765-4321',
    email: 'lee@example.com',
    company: '디자인스튜디오',
    groups: ['일반'],
    optInStatus: true,
    lastContact: '2024-11-18',
    messageCount: 5,
    createdAt: '2024-11-05',
  },
  {
    id: '3',
    name: '박민수',
    phone: '010-1111-2222',
    email: 'park@example.com',
    company: '',
    groups: ['VIP'],
    optInStatus: false,
    lastContact: '2024-11-15',
    messageCount: 8,
    createdAt: '2024-11-10',
  },
  {
    id: '4',
    name: '정수진',
    phone: '010-3333-4444',
    email: 'jung@example.com',
    company: '마케팅에이전시',
    groups: ['신규고객'],
    optInStatus: true,
    lastContact: '2024-11-22',
    messageCount: 3,
    createdAt: '2024-11-12',
  },
  {
    id: '5',
    name: '최동현',
    phone: '010-5555-6666',
    email: 'choi@example.com',
    company: '스타트업',
    groups: ['일반', 'VIP'],
    optInStatus: true,
    lastContact: '2024-11-21',
    messageCount: 15,
    createdAt: '2024-11-08',
  },
]

const sampleGroups = [
  { id: '1', name: 'VIP', count: 152, color: 'from-violet-500 to-purple-600' },
  { id: '2', name: '신규고객', count: 89, color: 'from-pingly-500 to-blue-600' },
  { id: '3', name: '일반', count: 543, color: 'from-gray-400 to-gray-600' },
  { id: '4', name: '휴면고객', count: 234, color: 'from-amber-500 to-orange-600' },
]

const groupColors: Record<string, string> = {
  VIP: 'bg-violet-100 text-violet-700',
  '신규고객': 'bg-pingly-100 text-pingly-700',
  '일반': 'bg-gray-100 text-gray-700',
  '휴면고객': 'bg-amber-100 text-amber-700',
}

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  const filteredContacts = sampleContacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGroup = !selectedGroup || contact.groups.includes(selectedGroup)
    return matchesSearch && matchesGroup
  })

  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(filteredContacts.map((c) => c.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter((i) => i !== id))
    } else {
      setSelectedContacts([...selectedContacts, id])
    }
  }

  return (
    <motion.div
      className="space-y-6"
      initial="initial"
      animate="animate"
      variants={stagger}
    >
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">연락처 관리</h1>
          <p className="text-muted-foreground mt-1">고객 연락처를 관리하고 그룹화하세요</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" leftIcon={<Upload className="h-4 w-4" />}>
            가져오기
          </Button>
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
            내보내기
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
            연락처 추가
          </Button>
        </div>
      </motion.div>

      {/* Groups */}
      <motion.div variants={fadeInUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sampleGroups.map((group) => (
          <motion.div
            key={group.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              interactive
              className={cn(
                'p-4 cursor-pointer',
                selectedGroup === group.name && 'ring-2 ring-primary'
              )}
              onClick={() => setSelectedGroup(selectedGroup === group.name ? null : group.name)}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
                  group.color
                )}>
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{group.name}</p>
                    {selectedGroup === group.name && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{group.count.toLocaleString()}명</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedContacts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="p-4 bg-pingly-50 dark:bg-pingly-950 border-pingly-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="pingly">{selectedContacts.length}명 선택됨</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" leftIcon={<MessageSquare className="h-4 w-4" />}>
                    메시지 보내기
                  </Button>
                  <Button variant="outline" size="sm" leftIcon={<Users className="h-4 w-4" />}>
                    그룹에 추가
                  </Button>
                  <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
                    내보내기
                  </Button>
                  <Button variant="destructive" size="sm" leftIcon={<Trash2 className="h-4 w-4" />}>
                    삭제
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contacts Table */}
      <motion.div variants={fadeInUp}>
        <Card className="overflow-hidden">
          {/* Table Header */}
          <div className="p-4 border-b">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">전체 연락처</h2>
                <p className="text-sm text-muted-foreground">
                  총 {sampleContacts.length}명의 연락처
                  {selectedGroup && ` • ${selectedGroup} 필터 적용됨`}
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="이름, 전화번호, 이메일 검색"
                  variant="filled"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead className="hidden md:table-cell">회사</TableHead>
                  <TableHead className="hidden lg:table-cell">그룹</TableHead>
                  <TableHead>수신동의</TableHead>
                  <TableHead className="hidden sm:table-cell">최근 연락</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.length === 0 ? (
                  <TableEmpty
                    colSpan={7}
                    icon={<Users className="h-8 w-8" />}
                    title="연락처가 없습니다"
                    description="검색 조건을 변경하거나 새 연락처를 추가해보세요"
                    action={
                      <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        연락처 추가
                      </Button>
                    }
                  />
                ) : (
                  filteredContacts.map((contact, i) => (
                    <TableRow
                      key={contact.id}
                      isSelected={selectedContacts.includes(contact.id)}
                      isClickable
                      onClick={() => toggleSelect(contact.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={() => toggleSelect(contact.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            <AvatarFallback>{contact.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {contact.phone}
                              </span>
                              <span className="hidden sm:flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {contact.email}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {contact.company ? (
                          <span className="flex items-center gap-1 text-sm">
                            <Building className="h-3 w-3 text-muted-foreground" />
                            {contact.company}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {contact.groups.map((group) => (
                            <Badge
                              key={group}
                              variant="secondary"
                              size="sm"
                              className={groupColors[group]}
                            >
                              {group}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={contact.optInStatus ? 'success' : 'destructive'}
                          size="sm"
                        >
                          {contact.optInStatus ? '동의' : '거부'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {contact.lastContact}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredContacts.length > 0 && (
            <TablePagination
              currentPage={1}
              totalPages={1}
              totalItems={filteredContacts.length}
              pageSize={10}
              onPageChange={() => {}}
            />
          )}
        </Card>
      </motion.div>

      {/* Add Contact Modal */}
      <Modal open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>연락처 추가</ModalTitle>
            <ModalDescription>새로운 연락처를 추가합니다</ModalDescription>
          </ModalHeader>

          <ModalBody>
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="이름"
                  placeholder="홍길동"
                  required
                />
                <Input
                  label="전화번호"
                  placeholder="010-1234-5678"
                  required
                />
              </div>
              <Input
                label="이메일"
                type="email"
                placeholder="email@example.com"
              />
              <Input
                label="회사명"
                placeholder="회사명"
              />
              <Checkbox
                label="광고성 메시지 수신 동의"
                description="마케팅 메시지를 발송하려면 동의가 필요합니다"
                defaultChecked
              />
            </form>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setIsAddModalOpen(false)} leftIcon={<UserPlus className="h-4 w-4" />}>
              추가
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  )
}
