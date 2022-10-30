import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import cn from 'classnames';

import { markdown } from './methodology.md.js';

import s from './s.module.css';

export default function MethodologyPage() {
  return (
    <div className="container">
      <ReactMarkdown
        className={cn(s.wrap, 'markdown')}
        children={markdown}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a: ({ node, ...props }) => (
            // eslint-disable-next-line jsx-a11y/anchor-has-content
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      />
    </div>
  );
}
