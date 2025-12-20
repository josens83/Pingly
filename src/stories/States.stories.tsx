import type { Meta, StoryObj } from '@storybook/react'
import { FileX, Users, MessageSquare, Inbox, Search, Wifi } from 'lucide-react'
import { fn } from '@storybook/test'

import { EmptyState } from '@/components/ui/states/empty-state'
import { ErrorState } from '@/components/ui/states/error-state'

// EmptyState Stories
const emptyStateMeta: Meta<typeof EmptyState> = {
  title: 'UI/States/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default emptyStateMeta
type EmptyStateStory = StoryObj<typeof emptyStateMeta>

export const NoContacts: EmptyStateStory = {
  args: {
    icon: Users,
    title: '연락처가 없습니다',
    description: '아직 등록된 연락처가 없습니다. 첫 번째 연락처를 추가해보세요.',
    action: {
      label: '연락처 추가',
      onClick: fn(),
    },
  },
}

export const NoCampaigns: EmptyStateStory = {
  args: {
    icon: MessageSquare,
    title: '캠페인이 없습니다',
    description: '새로운 마케팅 캠페인을 만들어 고객에게 메시지를 보내보세요.',
    action: {
      label: '캠페인 만들기',
      onClick: fn(),
    },
    secondaryAction: {
      label: '가이드 보기',
      onClick: fn(),
    },
  },
}

export const NoMessages: EmptyStateStory = {
  args: {
    icon: Inbox,
    title: '메시지가 없습니다',
    description: '아직 주고받은 메시지가 없습니다.',
  },
}

export const NoResults: EmptyStateStory = {
  args: {
    icon: Search,
    title: '검색 결과 없음',
    description: '검색어와 일치하는 결과를 찾을 수 없습니다. 다른 키워드로 검색해보세요.',
    action: {
      label: '검색 초기화',
      onClick: fn(),
    },
  },
}

export const NoFiles: EmptyStateStory = {
  args: {
    icon: FileX,
    title: '파일이 없습니다',
    description: '업로드된 파일이 없습니다. 파일을 업로드하여 시작하세요.',
    action: {
      label: '파일 업로드',
      onClick: fn(),
    },
  },
}

// ErrorState Stories
export const ErrorStateMeta: Meta<typeof ErrorState> = {
  title: 'UI/States/ErrorState',
  component: ErrorState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

type ErrorStateStory = StoryObj<typeof ErrorStateMeta>

export const DefaultError: ErrorStateStory = {
  render: () => <ErrorState onRetry={fn()} />,
}

export const NetworkError: ErrorStateStory = {
  render: () => (
    <ErrorState
      title="네트워크 오류"
      message="인터넷 연결을 확인해주세요."
      onRetry={fn()}
    />
  ),
}

export const NotFoundError: ErrorStateStory = {
  render: () => (
    <ErrorState
      title="페이지를 찾을 수 없습니다"
      message="요청하신 페이지가 존재하지 않거나 이동되었습니다."
      onGoBack={fn()}
      onGoHome={fn()}
    />
  ),
}

export const ServerError: ErrorStateStory = {
  render: () => (
    <ErrorState
      title="서버 오류"
      message="서버에서 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
      onRetry={fn()}
      onGoHome={fn()}
    />
  ),
}

export const AllActions: ErrorStateStory = {
  render: () => (
    <ErrorState
      title="오류가 발생했습니다"
      message="예상치 못한 오류가 발생했습니다."
      onRetry={fn()}
      onGoBack={fn()}
      onGoHome={fn()}
    />
  ),
}

// Combined Story for comparison
export const StatesComparison: EmptyStateStory = {
  render: () => (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium text-muted-foreground mb-4">Empty State</p>
        <EmptyState
          icon={Wifi}
          title="데이터 없음"
          description="표시할 데이터가 없습니다."
          action={{ label: '새로고침', onClick: fn() }}
        />
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium text-muted-foreground mb-4">Error State</p>
        <ErrorState
          title="오류 발생"
          message="데이터를 불러오는 중 오류가 발생했습니다."
          onRetry={fn()}
        />
      </div>
    </div>
  ),
}
