'use client';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

// ============================================================================
// Styled Components
// ============================================================================

const MarkdownContainer = styled(Box)(({ theme }) => ({
  '& p': {
    margin: '0.5rem 0',
    lineHeight: 1.6,
  },
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    margin: '1rem 0 0.5rem 0',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  '& h1': {
    fontSize: '1.5rem',
  },
  '& h2': {
    fontSize: '1.25rem',
  },
  '& h3': {
    fontSize: '1.1rem',
  },
  '& h4, & h5, & h6': {
    fontSize: '1rem',
  },
  '& ul, & ol': {
    margin: '0.5rem 0',
    paddingLeft: '1.5rem',
  },
  '& li': {
    margin: '0.25rem 0',
    lineHeight: 1.6,
  },
  '& code': {
    backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#f5f5f5',
    color: theme.palette.mode === 'dark' ? '#e8e8e8' : '#333',
    padding: '0.2rem 0.4rem',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '0.9em',
  },
  '& pre': {
    backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
    color: theme.palette.mode === 'dark' ? '#e8e8e8' : '#333',
    padding: '1rem',
    borderRadius: '8px',
    overflow: 'auto',
    margin: '0.5rem 0',
    lineHeight: 1.4,
    '& code': {
      backgroundColor: 'transparent',
      color: 'inherit',
      padding: 0,
      borderRadius: 0,
    },
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    paddingLeft: '1rem',
    marginLeft: 0,
    marginRight: 0,
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  '& hr': {
    margin: '1rem 0',
    border: 'none',
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  '& table': {
    borderCollapse: 'collapse',
    width: '100%',
    margin: '0.5rem 0',
    '& th, & td': {
      border: `1px solid ${theme.palette.divider}`,
      padding: '0.5rem',
      textAlign: 'left',
    },
    '& th': {
      backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#f5f5f5',
      fontWeight: 600,
    },
  },
  '& img': {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '8px',
    margin: '0.5rem 0',
  },
}));

// ============================================================================
// Component
// ============================================================================

interface MarkdownMessageProps {
  content: string;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  // Memoize the markdown rendering to avoid unnecessary re-renders
  const renderedContent = useMemo(() => {
    // Check if content contains markdown syntax
    const hasMarkdown = /[#*_`\[\]()~\-+>|]/.test(content);

    if (!hasMarkdown) {
      // If no markdown detected, render as plain text
      return (
        <Typography
          variant="body2"
          sx={{
            color: 'text.primary',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {content}
        </Typography>
      );
    }

    // Render as markdown
    return (
      <MarkdownContainer>
        <ReactMarkdown
          components={{
            // Override default components for better styling
            p: ({ children }) => (
              <Typography variant="body2" component="p" sx={{ color: 'text.primary' }}>
                {children}
              </Typography>
            ),
            h1: ({ children }) => (
              <Typography variant="h5" component="h1" sx={{ color: 'text.primary' }}>
                {children}
              </Typography>
            ),
            h2: ({ children }) => (
              <Typography variant="h6" component="h2" sx={{ color: 'text.primary' }}>
                {children}
              </Typography>
            ),
            h3: ({ children }) => (
              <Typography variant="subtitle1" component="h3" sx={{ color: 'text.primary' }}>
                {children}
              </Typography>
            ),
            h4: ({ children }) => (
              <Typography variant="subtitle2" component="h4" sx={{ color: 'text.primary' }}>
                {children}
              </Typography>
            ),
            h5: ({ children }) => (
              <Typography variant="body1" component="h5" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {children}
              </Typography>
            ),
            h6: ({ children }) => (
              <Typography variant="body2" component="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {children}
              </Typography>
            ),
            ul: ({ children }) => (
              <Box component="ul" sx={{ color: 'text.primary' }}>
                {children}
              </Box>
            ),
            ol: ({ children }) => (
              <Box component="ol" sx={{ color: 'text.primary' }}>
                {children}
              </Box>
            ),
            li: ({ children }) => (
              <Box component="li" sx={{ color: 'text.primary' }}>
                {children}
              </Box>
            ),
            code: ({ children }) => (
              <Typography component="code" variant="body2" sx={{ color: 'text.primary' }}>
                {children}
              </Typography>
            ),
            pre: ({ children }) => (
              <Box component="pre" sx={{ color: 'text.primary' }}>
                {children}
              </Box>
            ),
            blockquote: ({ children }) => (
              <Box component="blockquote" sx={{ color: 'text.primary' }}>
                {children}
              </Box>
            ),
            a: ({ href, children }) => (
              <Typography component="a" href={href} target="_blank" rel="noopener noreferrer" sx={{ color: 'primary.main' }}>
                {children}
              </Typography>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </MarkdownContainer>
    );
  }, [content]);

  return renderedContent;
}

