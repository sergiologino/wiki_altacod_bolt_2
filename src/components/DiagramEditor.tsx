import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface DiagramEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const DiagramEditor: React.FC<DiagramEditorProps> = ({ value, onChange }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      themeVariables: {
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
      }
    });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!previewRef.current) return;
      
      try {
        previewRef.current.innerHTML = '';
        setError(null);
        await mermaid.render('diagram', value, (svgCode) => {
          if (previewRef.current) {
            previewRef.current.innerHTML = svgCode;
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      }
    };

    renderDiagram();
  }, [value]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex gap-4 p-4">
        <div className="flex-1">
          <div className="mb-2 font-medium text-gray-700">Diagram Code</div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-[calc(100%-2rem)] p-4 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your diagram code here..."
          />
        </div>
        <div className="flex-1">
          <div className="mb-2 font-medium text-gray-700">Preview</div>
          <div className="h-[calc(100%-2rem)] p-4 border rounded-lg bg-white overflow-auto">
            {error ? (
              <div className="text-red-500 text-sm">{error}</div>
            ) : (
              <div ref={previewRef} className="flex items-center justify-center h-full" />
            )}
          </div>
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t">
        <details className="text-sm text-gray-600">
          <summary className="cursor-pointer hover:text-gray-900">Example Diagrams</summary>
          <div className="mt-2 space-y-2">
            <div>
              <div className="font-medium">Flowchart:</div>
              <pre className="p-2 bg-gray-100 rounded">
{`graph TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B -->|No| E[End]`}
              </pre>
            </div>
            <div>
              <div className="font-medium">Sequence Diagram:</div>
              <pre className="p-2 bg-gray-100 rounded">
{`sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!`}
              </pre>
            </div>
            <div>
              <div className="font-medium">Class Diagram:</div>
              <pre className="p-2 bg-gray-100 rounded">
{`classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal: +String name
    Animal: +swim()
    Animal: +walk()`}
              </pre>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default DiagramEditor;