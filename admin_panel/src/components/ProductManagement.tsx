import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter
} from 'lucide-react'
import { productsAPI } from '@/app/api'
import type { Product } from '@/app/api'

interface ProductFormData {
  sku: string
  name: string
  description: string
  gender: 'men' | 'women'
  price_cents: number
  currency: string
  is_active: boolean
  sizes: string[]
  colors: string[]
  tags: string[]
}

interface ProductParams {
  limit: number
  offset: number
  search?: string
  gender?: string
  is_active?: boolean
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [genderFilter, setGenderFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    sku: '',
    name: '',
    description: '',
    gender: 'men',
    price_cents: 0,
    currency: 'INR',
    is_active: true,
    sizes: [],
    colors: [],
    tags: []
  })

  const itemsPerPage = 10

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      const params: ProductParams = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage
      }
      
      if (searchTerm) params.search = searchTerm
      if (genderFilter && genderFilter !== 'all') params.gender = genderFilter
      if (statusFilter && statusFilter !== 'all') params.is_active = statusFilter === 'active'

      const response = await productsAPI.listProducts(params)
      setProducts(response.products)
      setTotalProducts(response.total)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, genderFilter, statusFilter, itemsPerPage])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleCreateProduct = async () => {
    try {
      const formDataObj = new FormData()
      formDataObj.append('sku', formData.sku)
      formDataObj.append('name', formData.name)
      formDataObj.append('description', formData.description)
      formDataObj.append('gender', formData.gender)
      formDataObj.append('price_cents', formData.price_cents.toString())
      formDataObj.append('currency', formData.currency)
      formDataObj.append('is_active', formData.is_active.toString())
      formDataObj.append('sizes', formData.sizes.join(','))
      formDataObj.append('colors', formData.colors.join(','))
      formDataObj.append('tags', formData.tags.join(','))

      await productsAPI.createProduct(formDataObj)
      setIsCreateDialogOpen(false)
      resetForm()
      loadProducts()
    } catch (error) {
      console.error('Failed to create product:', error)
    }
  }

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return

    try {
      await productsAPI.updateProduct(selectedProduct.id, {
        name: formData.name,
        description: formData.description,
        gender: formData.gender,
        price_cents: formData.price_cents,
        currency: formData.currency,
        is_active: formData.is_active
      })
      setIsEditDialogOpen(false)
      resetForm()
      loadProducts()
    } catch (error) {
      console.error('Failed to update product:', error)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.deleteProduct(productId)
        loadProducts()
      } catch (error) {
        console.error('Failed to delete product:', error)
      }
    }
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      gender: product.gender as 'men' | 'women',
      price_cents: product.price_cents,
      currency: product.currency,
      is_active: product.is_active,
      sizes: product.variants.map(v => v.size),
      colors: product.variants.map(v => v.color).filter(Boolean) as string[],
      tags: product.tag_names
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      gender: 'men',
      price_cents: 0,
      currency: 'INR',
      is_active: true,
      sizes: [],
      colors: [],
      tags: []
    })
    setSelectedProduct(null)
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(cents / 100)
  }

  const totalPages = Math.ceil(totalProducts / itemsPerPage)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Create a new product in your catalog</DialogDescription>
            </DialogHeader>
            <ProductForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreateProduct}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All genders</SelectItem>
                  <SelectItem value="men">Men</SelectItem>
                  <SelectItem value="women">Women</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setGenderFilter('all')
                  setStatusFilter('all')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({totalProducts})</CardTitle>
          <CardDescription>Manage your product catalog</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {product.images[0] && (
                            <img
                              src={product.images[0].url}
                              alt={product.images[0].alt_text || product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground capitalize">{product.gender}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>{formatCurrency(product.price_cents)}</TableCell>
                      <TableCell>
                        <Badge variant={product.total_stock > 0 ? "default" : "destructive"}>
                          {product.total_stock} in stock
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {product.tag_names.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {product.tag_names.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{product.tag_names.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} products
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          <ProductForm 
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdateProduct}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ProductFormProps {
  formData: ProductFormData
  setFormData: (data: ProductFormData) => void
  onSubmit: () => void
  isEdit?: boolean
}

function ProductForm({ formData, setFormData, onSubmit, isEdit = false }: ProductFormProps) {
  const handleInputChange = (field: keyof ProductFormData, value: string | number | boolean) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => handleInputChange('sku', e.target.value)}
            disabled={isEdit}
            placeholder="PROD-001"
          />
        </div>
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Product name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="w-full min-h-[100px] p-3 border border-input rounded-md"
          placeholder="Product description"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="men">Men</SelectItem>
              <SelectItem value="women">Women</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price_cents / 100}
            onChange={(e) => handleInputChange('price_cents', Math.round(parseFloat(e.target.value) * 100))}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INR">INR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => handleInputChange('is_active', e.target.checked)}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setFormData({
          sku: '',
          name: '',
          description: '',
          gender: 'men',
          price_cents: 0,
          currency: 'INR',
          is_active: true,
          sizes: [],
          colors: [],
          tags: []
        })}>
          Reset
        </Button>
        <Button onClick={onSubmit}>
          {isEdit ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </div>
  )
} 