import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { tagsAPI, collectionsAPI } from '@/app/api'


interface QuickCreateDialogProps {
  children: React.ReactNode
}

export function QuickCreateDialog({ children }: QuickCreateDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'tag' | 'collection'>('tag')
  const [tagData, setTagData] = useState({ name: '', description: '' })
  const [collectionData, setCollectionData] = useState({ name: '', description: '' })
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tagData.name.trim()) return

    try {
      setIsLoading(true)
      await tagsAPI.createTag(tagData)
      setTagData({ name: '', description: '' })
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to create tag:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!collectionData.name.trim()) return

    try {
      setIsLoading(true)
      await collectionsAPI.createCollection(collectionData)
      setCollectionData({ name: '', description: '' })
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to create collection:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Quick Create</DialogTitle>
          <DialogDescription>
            Quickly create a new tag or collection for your marketplace.
          </DialogDescription>
        </DialogHeader>

        <div className="flex space-x-2 mb-4">
          <Button
            variant={activeTab === 'tag' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('tag')}
          >
            Tag
          </Button>
          <Button
            variant={activeTab === 'collection' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('collection')}
          >
            Collection
          </Button>
        </div>

        {activeTab === 'tag' ? (
          <form onSubmit={handleCreateTag} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                value={tagData.name}
                onChange={(e) => setTagData({ ...tagData, name: e.target.value })}
                placeholder="Enter tag name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag-description">Description (Optional)</Label>
              <Input
                id="tag-description"
                value={tagData.description}
                onChange={(e) => setTagData({ ...tagData, description: e.target.value })}
                placeholder="Enter tag description"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !tagData.name.trim()}
              >
                {isLoading ? 'Creating...' : 'Create Tag'}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateCollection} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="collection-name">Collection Name</Label>
              <Input
                id="collection-name"
                value={collectionData.name}
                onChange={(e) => setCollectionData({ ...collectionData, name: e.target.value })}
                placeholder="Enter collection name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collection-description">Description (Optional)</Label>
              <Input
                id="collection-description"
                value={collectionData.description}
                onChange={(e) => setCollectionData({ ...collectionData, description: e.target.value })}
                placeholder="Enter collection description"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !collectionData.name.trim()}
              >
                {isLoading ? 'Creating...' : 'Create Collection'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
} 