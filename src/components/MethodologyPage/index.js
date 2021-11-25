import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import cn from 'classnames';

import s from './s.module.css';

export default function MethodologyPage() {
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    import('./methodology.md')
      .then((res) => {
        fetch(res.default)
          .then((res) => res.text())
          .then((res) => setMarkdown(res))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="container">
      <ReactMarkdown
        className={cn(s.wrap, 'markdown')}
        children={markdown}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      />
    </div>
  );
}
