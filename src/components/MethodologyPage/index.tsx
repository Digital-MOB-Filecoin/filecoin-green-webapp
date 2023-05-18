import cn from 'classnames';
import { ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { markdown } from './methodology.md.js';
import s from './s.module.css';

export default function MethodologyPage(): ReactElement {
  return (
    <div className="container">
      <ReactMarkdown
        className={cn(s.wrap, 'markdown')}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a: ({ node, children, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
