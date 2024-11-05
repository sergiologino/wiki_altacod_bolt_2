import React, { useState } from 'react';
import Editor from './components/Editor';
import PageTree from './components/PageTree';
import { useWikiStore } from './store';

function App() {
  const [selectedPageId, setSelectedPageId] = useState<string>('root');
  const { pages, updatePage } = useWikiStore();
  const currentPage = pages.find(p => p.id === selectedPageId);

  return (
    <div className="h-screen flex bg-gray-50">
      <div className="w-1/5 min-w-[250px] border-r border-gray-200 bg-white overflow-hidden flex flex-col">
        <PageTree
          selectedPageId={selectedPageId}
          onSelectPage={setSelectedPageId}
        />
      </div>
      <div className="flex-1 overflow-hidden flex flex-col bg-white">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            value={currentPage?.title || ''}
            onChange={(e) => {
              updatePage(selectedPageId, { title: e.target.value });
            }}
            className="text-2xl font-bold w-full border-none focus:outline-none bg-transparent"
            placeholder="Page Title"
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <Editor pageId={selectedPageId} />
        </div>
      </div>
    </div>
  );
}

export default App;