'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, ChevronsUpDown, ArrowUpDown } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const tableVariants = cva('w-full caption-bottom text-sm', {
  variants: {
    variant: {
      default: '',
      striped: '[&_tbody_tr:nth-child(odd)]:bg-muted/50',
      bordered: '[&_th]:border [&_td]:border',
    },
    size: {
      sm: '[&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2',
      default: '[&_th]:px-4 [&_th]:py-3 [&_td]:px-4 [&_td]:py-3',
      lg: '[&_th]:px-6 [&_th]:py-4 [&_td]:px-6 [&_td]:py-4',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

interface TableContextValue {
  variant?: 'default' | 'striped' | 'bordered' | null
}

const TableContext = React.createContext<TableContextValue>({})

export interface TableProps
  extends React.HTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableVariants> {}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant, size, ...props }, ref) => (
    <TableContext.Provider value={{ variant }}>
      <div className="relative w-full overflow-auto rounded-xl border">
        <table
          ref={ref}
          className={cn(tableVariants({ variant, size }), className)}
          {...props}
        />
      </div>
    </TableContext.Provider>
  )
)
Table.displayName = 'Table'

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('bg-muted/50 [&_tr]:border-b', className)}
    {...props}
  />
))
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
))
TableBody.displayName = 'TableBody'

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
      className
    )}
    {...props}
  />
))
TableFooter.displayName = 'TableFooter'

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  isSelected?: boolean
  isClickable?: boolean
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, isSelected, isClickable, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b transition-colors',
        isClickable && 'cursor-pointer hover:bg-muted/50',
        isSelected && 'bg-primary/5',
        className
      )}
      {...props}
    />
  )
)
TableRow.displayName = 'TableRow'

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean
  sortDirection?: 'asc' | 'desc' | null
  onSort?: () => void
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortable, sortDirection, onSort, children, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-12 text-left align-middle font-semibold text-muted-foreground',
        '[&:has([role=checkbox])]:pr-0',
        sortable && 'cursor-pointer select-none hover:text-foreground',
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && (
          <span className="shrink-0">
            {sortDirection === 'asc' ? (
              <ChevronUp className="h-4 w-4" />
            ) : sortDirection === 'desc' ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            )}
          </span>
        )}
      </div>
    </th>
  )
)
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('align-middle [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
))
TableCell.displayName = 'TableCell'

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-muted-foreground', className)}
    {...props}
  />
))
TableCaption.displayName = 'TableCaption'

// Empty State for Table
interface TableEmptyProps extends React.HTMLAttributes<HTMLTableRowElement> {
  colSpan: number
  icon?: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
}

const TableEmpty = React.forwardRef<HTMLTableRowElement, TableEmptyProps>(
  (
    {
      className,
      colSpan,
      icon,
      title = '데이터가 없습니다',
      description,
      action,
      ...props
    },
    ref
  ) => (
    <tr ref={ref} className={className} {...props}>
      <td colSpan={colSpan}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          {icon && (
            <div className="mb-4 rounded-full bg-muted p-4 text-muted-foreground">
              {icon}
            </div>
          )}
          <p className="font-medium text-muted-foreground">{title}</p>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground/70">{description}</p>
          )}
          {action && <div className="mt-4">{action}</div>}
        </motion.div>
      </td>
    </tr>
  )
)
TableEmpty.displayName = 'TableEmpty'

// Loading skeleton for table rows
interface TableSkeletonProps {
  columns: number
  rows?: number
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ columns, rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <TableRow key={rowIndex}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <TableCell key={colIndex}>
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
)
TableSkeleton.displayName = 'TableSkeleton'

// Pagination component for tables
interface TablePaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  className?: string
}

const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}) => {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3 border-t',
        className
      )}
    >
      <p className="text-sm text-muted-foreground">
        전체 {totalItems}개 중 {startItem}-{endItem}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            'hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          이전
        </button>
        <span className="text-sm text-muted-foreground">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            'hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          다음
        </button>
      </div>
    </div>
  )
}
TablePagination.displayName = 'TablePagination'

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableEmpty,
  TableSkeleton,
  TablePagination,
}
