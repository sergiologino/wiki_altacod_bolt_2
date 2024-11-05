import React, { useRef, useCallback, useMemo, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useWikiStore } from '../store';
import { EditorToolbar } from './EditorToolbar';
import ImageResize from 'quill-image-resize-module-react';
import ImageUploader from './ImageUploader';
import TableInsert from './TableInsert';
import DiagramEditor from './DiagramEditor';
import { FileCode2 } from 'lucide-react';

Quill.register('modules/imageResize', ImageResize);

const QuillEditor = React.forwardRef<ReactQuill, any>((props, ref) => {
  return <ReactQuill ref={ref} {...props} />;
});

QuillEditor.displayName = 'QuillEditor';

interface EditorProps {
  pageId: string;
}

const Editor: React.FC<EditorProps> = ({ pageId }) => {
  const quillRef = useRef<ReactQuill>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { pages, updatePage } = useWikiStore();
  const currentPage = pages.find(p => p.id === pageId);
  const [showDiagramEditor, setShowDiagramEditor] = useState(false);
  const [diagramCode, setDiagramCode] = useState('');

  const insertImage = useCallback((url: string) => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true);
      editor.insertEmbed(range.index, 'image', url, 'user');
      editor.setSelection(range.index + 1, 0);
    }
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && quillRef.current) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          insertImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const insertTable = useCallback((rows: number, cols: number) => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true);
      
      const tableHTML = `
        <table>
          <tbody>
            ${Array(rows).fill(0).map(() => 
              `<tr>${Array(cols).fill(0).map(() => 
                `<td><p><br></p></td>`
              ).join('')}</tr>`
            ).join('')}
          </tbody>
        </table>
      `;
      
      editor.clipboard.dangerouslyPasteHTML(range.index, tableHTML, 'user');
      editor.setSelection(range.index + 1, 0);
    }
  }, []);

  const insertDiagram = useCallback((code: string) => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true);
      
      // Create a container for the diagram
      const diagramContainer = document.createElement('div');
      diagramContainer.setAttribute('class', 'mermaid');
      diagramContainer.textContent = code;
      
      // Insert the diagram container
      const delta = editor.clipboard.convert(diagramContainer.outerHTML);
      editor.updateContents(editor.clipboard.convert(delta));
      editor.setSelection(range.index + 1, 0);
      
      // Initialize Mermaid for the new diagram
      window.mermaid?.init(undefined, document.querySelectorAll('.mermaid'));
    }
    setShowDiagramEditor(false);
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: '#toolbar',
      handlers: {
        image: () => {},
        table: () => {}
      }
    },
    clipboard: {
      matchVisual: false
    },
    imageResize: {
      parchment: Quill.import('parchment'),
      modules: ['Resize', 'DisplaySize']
    }
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link', 'image',
    'table'
  ];

  const handleChange = useCallback((content: string) => {
    if (pageId && content !== currentPage?.content) {
      updatePage(pageId, { content });
    }
  }, [pageId, currentPage?.content, updatePage]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 p-2 border-b">
        <EditorToolbar />
        <ImageUploader ref={fileInputRef} onImageInsert={insertImage} />
        <TableInsert onTableInsert={insertTable} />
        <button
          type="button"
          className="p-1 hover:bg-gray-100 rounded"
          onClick={() => setShowDiagramEditor(true)}
          title="Insert diagram"
        >
          <FileCode2 className="w-4 h-4" />
        </button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
      <div className="flex-1 relative">
        {showDiagramEditor ? (
          <div className="absolute inset-0 bg-white z-10">
            <DiagramEditor
              value={diagramCode}
              onChange={setDiagramCode}
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={() => setShowDiagramEditor(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => insertDiagram(diagramCode)}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Insert Diagram
              </button>
            </div>
          </div>
        ) : (
          <QuillEditor
            ref={quillRef}
            theme="snow"
            value={currentPage?.content || ''}
            onChange={handleChange}
            modules={modules}
            formats={formats}
            className="h-full"
          />
        )}
      </div>
    </div>
  );
};

export default Editor;