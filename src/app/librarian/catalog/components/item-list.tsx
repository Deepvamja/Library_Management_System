"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Edit, Trash2, Book, FileText, Newspaper } from "lucide-react"

type ItemWithStatus = {
  itemId: number
  title: string
  author: string
  isbn: string | null
  subject: string | null
  itemType: string
  price: number
  totalCopies: number
  availableCopies: number
  isVisible: boolean
  status: string
  createdAt: Date
  updatedAt: Date
}

interface ItemListProps {
  items: ItemWithStatus[]
  onEdit: (itemId: number) => void
  onDelete: (itemId: number) => void
}

const getItemIcon = (itemType: string) => {
  switch (itemType.toLowerCase()) {
    case 'book':
      return <Book className="h-4 w-4" />
    case 'magazine':
      return <Newspaper className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const getStatusBadge = (status: string, availableCopies: number, totalCopies: number) => {
  if (!status || status === "Available") {
    return <Badge variant="success">Available</Badge>
  }
  
  switch (status) {
    case "Issued":
      return <Badge variant="warning">Issued</Badge>
    case "Reserved":
      return <Badge variant="info">Reserved</Badge>
    case "Destroyed":
      return <Badge variant="destructive">Destroyed</Badge>
    case "Lost":
      return <Badge variant="destructive">Lost</Badge>
    case "Under Repair":
      return <Badge variant="secondary">Under Repair</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function ItemList({ items, onEdit, onDelete }: ItemListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <Book className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding a new book or magazine to the catalog.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Type</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>ISBN</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Copies</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.itemId}>
              <TableCell>
                <div className="flex items-center justify-center">
                  {getItemIcon(item.itemType)}
                </div>
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{item.title}</span>
                  <span className="text-xs text-gray-500 capitalize">
                    {item.itemType}
                  </span>
                </div>
              </TableCell>
              <TableCell>{item.author}</TableCell>
              <TableCell>
                <span className="font-mono text-sm">
                  {item.isbn || "N/A"}
                </span>
              </TableCell>
              <TableCell>{item.subject || "N/A"}</TableCell>
              <TableCell>
                {getStatusBadge(item.status, item.availableCopies, item.totalCopies)}
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-sm">
                  <span>Available: {item.availableCopies}</span>
                  <span className="text-gray-500">Total: {item.totalCopies}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">${item.price.toFixed(2)}</span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(item.itemId)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(item.itemId)}
                    className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
