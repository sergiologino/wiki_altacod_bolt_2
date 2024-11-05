import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Page {
  id: string;
  title: string;
  content: string;
  parentId: string | null;
}

interface WikiStore {
  pages: Page[];
  addPage: (title: string, parentId?: string | null) => void;
  updatePage: (id: string, updates: Partial<Page>) => void;
  deletePage: (id: string) => void;
  movePage: (id: string, newParentId: string | null) => void;
}

export const useWikiStore = create<WikiStore>()((set) => ({
  pages: [{
    id: 'root',
    title: 'Welcome to Your Wiki',
    content: 'Start editing this page or create a new one!',
    parentId: null
  }],
  
  addPage: (title, parentId = null) => set((state) => ({
    pages: [...state.pages, {
      id: uuidv4(),
      title,
      content: '',
      parentId
    }]
  })),

  updatePage: (id, updates) => set((state) => ({
    pages: state.pages.map(page =>
      page.id === id ? { ...page, ...updates } : page
    )
  })),

  deletePage: (id) => set((state) => ({
    pages: state.pages.filter(page => 
      page.id !== id && page.parentId !== id
    )
  })),

  movePage: (id, newParentId) => set((state) => ({
    pages: state.pages.map(page =>
      page.id === id ? { ...page, parentId: newParentId } : page
    )
  }))
}));