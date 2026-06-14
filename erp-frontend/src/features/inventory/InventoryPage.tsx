import { useState } from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import { useInventoryCategories, useInventory, useAddStockTransaction, useLedger, useCreateItem, useDeleteInventoryItem } from './hooks/useInventory';
import { StockTable } from './components/StockTable';
import { AddStockForm } from './components/AddStockForm';
import { StockLedger } from './components/StockLedger';
import { AddNewItemForm } from './components/AddNewItemForm';
import { SlideOver } from '../../components/ui/SlideOver';

export function InventoryPage() {
  const { data: categoriesData } = useInventoryCategories();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  const { data: inventoryData, isLoading: isInventoryLoading } = useInventory(activeCategory);
  const addStockMutation = useAddStockTransaction();
  const createItemMutation = useCreateItem();
  const deleteItemMutation = useDeleteInventoryItem();

  // SlideOver State
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [slideOverMode, setSlideOverMode] = useState<'add' | 'ledger' | 'createItem' | null>(null);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);

  // Derived data for SlideOver
  const selectedRecord = inventoryData?.data.find(r => r._id === selectedInventoryId);
  const { data: ledgerData, isLoading: isLedgerLoading } = useLedger(slideOverMode === 'ledger' ? selectedInventoryId : null);

  const categories = ['All', ...(categoriesData?.data || [])];
  
  const lowStockCount = inventoryData?.data.filter(r => r.currentStock <= r.reorderLevel).length || 0;

  const handleAddStock = (id: string) => {
    setSelectedInventoryId(id);
    setSlideOverMode('add');
    setSlideOverOpen(true);
  };

  const handleViewLedger = (id: string) => {
    setSelectedInventoryId(id);
    setSlideOverMode('ledger');
    setSlideOverOpen(true);
  };

  const handleCreateNewItem = () => {
    setSlideOverMode('createItem');
    setSlideOverOpen(true);
  };

  const handleCloseSlideOver = () => {
    setSlideOverOpen(false);
    setTimeout(() => {
      setSlideOverMode(null);
      setSelectedInventoryId(null);
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Inventory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage raw materials, consumables, and stock levels.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg shadow-sm">
              <AlertCircle size={18} />
              <span className="text-sm font-medium">{lowStockCount} items low on stock</span>
            </div>
          )}
          <button
            onClick={handleCreateNewItem}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm font-medium transition-colors"
          >
            <Plus size={18} />
            <span>New Item Master</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        
        {/* Tabs Header */}
        <div className="border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-black px-4 pt-4">
          <div className="flex space-x-6 overflow-x-auto pb-px custom-scrollbar">
            {categories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 dark:bg-black">
          <StockTable 
            data={inventoryData?.data || []} 
            isLoading={isInventoryLoading} 
            onAddStock={handleAddStock}
            onViewLedger={handleViewLedger}
            onDelete={(id) => deleteItemMutation.mutate(id)}
          />
        </div>
      </div>

      <SlideOver
        isOpen={slideOverOpen}
        onClose={handleCloseSlideOver}
        title={
          slideOverMode === 'add' ? 'Record Stock Transaction' : 
          slideOverMode === 'ledger' ? 'Stock Ledger History' : 
          'Create New Item Master'
        }
      >
        {slideOverMode === 'add' && selectedRecord && (
          <AddStockForm 
            inventoryId={selectedRecord._id}
            itemName={selectedRecord.itemRef.itemName}
            unit={selectedRecord.itemRef.unitOfMeasure}
            isSubmitting={addStockMutation.isPending}
            onSubmit={(data) => {
              addStockMutation.mutate(data, {
                onSuccess: () => {
                  handleCloseSlideOver();
                }
              });
            }}
          />
        )}
        
        {slideOverMode === 'ledger' && selectedRecord && (
          <StockLedger 
            transactions={ledgerData?.data || []}
            isLoading={isLedgerLoading}
            unit={selectedRecord.itemRef.unitOfMeasure}
          />
        )}

        {slideOverMode === 'createItem' && (
          <AddNewItemForm
            defaultCategory={activeCategory}
            isSubmitting={createItemMutation.isPending}
            onSubmit={(data) => {
              createItemMutation.mutate(data, {
                onSuccess: () => {
                  handleCloseSlideOver();
                }
              });
            }}
          />
        )}
      </SlideOver>

    </div>
  );
}