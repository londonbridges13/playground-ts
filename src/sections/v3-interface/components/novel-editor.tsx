'use client';

import { useCallback } from 'react';
import {
  EditorRoot,
  EditorContent,
  EditorCommand,
  EditorCommandList,
  EditorCommandItem,
  EditorCommandEmpty,
  type JSONContent,
  StarterKit,
  Placeholder,
  Command,
  TaskList,
  TaskItem,
  createSuggestionItems,
  renderItems,
  handleCommandNavigation,
} from 'novel';

import Box from '@mui/material/Box';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import TitleIcon from '@mui/icons-material/Title';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CodeIcon from '@mui/icons-material/Code';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

// ----------------------------------------------------------------------

interface NovelEditorProps {
  onChange?: (content: JSONContent) => void;
  initialContent?: JSONContent;
  editable?: boolean;
}

// ----------------------------------------------------------------------

// Define suggestion items for slash commands
const suggestionItems = createSuggestionItems([
  {
    title: 'Text',
    description: 'Just start typing with plain text.',
    searchTerms: ['p', 'paragraph'],
    icon: <TextFieldsIcon sx={{ fontSize: 18 }} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleNode('paragraph', 'paragraph').run();
    },
  },
  {
    title: 'Heading 1',
    description: 'Big section heading.',
    searchTerms: ['title', 'big', 'large', 'h1'],
    icon: <TitleIcon sx={{ fontSize: 18 }} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading.',
    searchTerms: ['subtitle', 'medium', 'h2'],
    icon: <TitleIcon sx={{ fontSize: 16 }} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading.',
    searchTerms: ['subtitle', 'small', 'h3'],
    icon: <TitleIcon sx={{ fontSize: 14 }} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
    },
  },
  {
    title: 'Bullet List',
    description: 'Create a simple bullet list.',
    searchTerms: ['unordered', 'point', 'ul'],
    icon: <FormatListBulletedIcon sx={{ fontSize: 18 }} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: 'Numbered List',
    description: 'Create a list with numbering.',
    searchTerms: ['ordered', 'ol'],
    icon: <FormatListNumberedIcon sx={{ fontSize: 18 }} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: 'Quote',
    description: 'Capture a quote.',
    searchTerms: ['blockquote'],
    icon: <FormatQuoteIcon sx={{ fontSize: 18 }} />,
    command: ({ editor, range }: any) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode('paragraph', 'paragraph')
        .toggleBlockquote()
        .run();
    },
  },
  {
    title: 'Code',
    description: 'Capture a code snippet.',
    searchTerms: ['codeblock'],
    icon: <CodeIcon sx={{ fontSize: 18 }} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: 'To-do List',
    description: 'Track tasks with a to-do list.',
    searchTerms: ['todo', 'task', 'list', 'check', 'checkbox'],
    icon: <CheckBoxIcon sx={{ fontSize: 18 }} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
]);

// Configure slash command extension
const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
    render: renderItems,
  },
});

// Configure extensions for the editor
const extensions = [
  StarterKit.configure({
    bulletList: {
      HTMLAttributes: {
        class: 'list-disc list-outside leading-3 -mt-2',
      },
    },
    orderedList: {
      HTMLAttributes: {
        class: 'list-decimal list-outside leading-3 -mt-2',
      },
    },
    listItem: {
      HTMLAttributes: {
        class: 'leading-normal -mb-2',
      },
    },
    blockquote: {
      HTMLAttributes: {
        class: 'border-l-4 border-gray-500',
      },
    },
    codeBlock: {
      HTMLAttributes: {
        class: 'rounded-sm bg-gray-800 border p-5 font-mono font-medium',
      },
    },
    code: {
      HTMLAttributes: {
        class: 'rounded-md bg-gray-700 px-1.5 py-1 font-mono font-medium',
        spellcheck: 'false',
      },
    },
    horizontalRule: false,
    dropcursor: {
      color: '#DBEAFE',
      width: 4,
    },
    gapcursor: false,
  }),
  Placeholder.configure({
    placeholder: "Type '/' for commands...",
  }),
  TaskList.configure({
    HTMLAttributes: {
      class: 'task-list',
    },
  }),
  TaskItem.configure({
    HTMLAttributes: {
      class: 'task-item',
    },
    nested: true,
  }),
  slashCommand,
];

export function NovelEditor({ onChange, initialContent, editable = true }: NovelEditorProps) {
  const handleUpdate = useCallback(
    ({ editor }: { editor: any }) => {
      if (onChange && editable) {
        onChange(editor.getJSON());
      }
    },
    [onChange, editable]
  );

  return (
    <Box
      sx={{
        height: '100%',
        position: 'relative',
        '& .tiptap': {
          height: '100%',
          minHeight: 150,
          p: 2,
          outline: 'none',
          '& p': {
            margin: 0,
            marginBottom: 1,
          },
          '& p.is-editor-empty:first-of-type::before': {
            content: 'attr(data-placeholder)',
            color: '#9ca3af',
            pointerEvents: 'none',
            float: 'left',
            height: 0,
          },
          '& h1': {
            fontSize: '1.875rem',
            fontWeight: 700,
            marginBottom: 1,
          },
          '& h2': {
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: 1,
          },
          '& h3': {
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: 1,
          },
          '& ul, & ol': {
            paddingLeft: 3,
            marginBottom: 1,
          },
          '& blockquote': {
            borderLeft: '3px solid #6b7280',
            paddingLeft: 2,
            marginLeft: 0,
            color: '#9ca3af',
            fontStyle: 'italic',
          },
          '& code': {
            bgcolor: '#374151',
            px: 0.5,
            py: 0.25,
            borderRadius: 0.5,
            fontFamily: 'monospace',
            fontSize: '0.875em',
          },
          '& pre': {
            bgcolor: '#1f2937',
            color: '#f9fafb',
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            '& code': {
              bgcolor: 'transparent',
              p: 0,
            },
          },
          '& ul[data-type="taskList"]': {
            listStyle: 'none',
            padding: 0,
            '& li': {
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              '& input[type="checkbox"]': {
                marginTop: '4px',
              },
            },
          },
        },
      }}
    >
      <EditorRoot>
        <EditorContent
          extensions={extensions}
          initialContent={initialContent}
          onUpdate={handleUpdate}
          editorProps={{
            editable: () => editable,
            handleDOMEvents: {
              keydown: (_view, event) => editable ? handleCommandNavigation(event) : false,
            },
            attributes: {
              class: 'tiptap',
            },
          }}
        >
          {editable && (
            <EditorCommand
              style={{
                zIndex: 50,
                height: 'auto',
                maxHeight: '330px',
                width: '288px',
                overflow: 'hidden',
                overflowY: 'auto',
                borderRadius: '8px',
                border: '1px solid #374151',
                backgroundColor: '#1f2937',
                padding: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
              }}
            >
              <EditorCommandEmpty style={{ padding: '8px', color: '#9ca3af' }}>
                No results
              </EditorCommandEmpty>
              <EditorCommandList>
                {suggestionItems.map((item: any) => (
                  <EditorCommandItem
                    key={item.title}
                    value={item.title}
                    onCommand={(val) => item.command(val)}
                    style={{
                      display: 'flex',
                      width: '100%',
                      alignItems: 'center',
                      gap: '8px',
                      borderRadius: '6px',
                      padding: '8px',
                      textAlign: 'left',
                      fontSize: '14px',
                      cursor: 'pointer',
                      color: '#e5e7eb',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#374151';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        height: 40,
                        width: 40,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                        border: '1px solid #374151',
                        bgcolor: '#111827',
                        color: '#9ca3af',
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box>
                      <Box sx={{ fontWeight: 500, color: '#f3f4f6' }}>{item.title}</Box>
                      <Box sx={{ fontSize: '12px', color: '#9ca3af' }}>{item.description}</Box>
                    </Box>
                  </EditorCommandItem>
                ))}
              </EditorCommandList>
            </EditorCommand>
          )}
        </EditorContent>
      </EditorRoot>
    </Box>
  );
}

