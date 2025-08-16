import React, { ComponentPropsWithoutRef, useState } from 'react';
import ReactMarkdown, { ExtraProps } from 'react-markdown';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import markdown from 'react-syntax-highlighter/dist/esm/languages/hljs/markdown';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import html from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import {
  atomOneDark,
  atomOneLight,
} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import CodeCopyButton from './CodeCopyButton';
import CustomContainerComponent from './CustomContainer';
import './syntax-highlighter.less';
import { preprocessCustomContainers } from './utils';

// 注册语言
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('html', html);
SyntaxHighlighter.registerLanguage('xml', html);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('shell', bash);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('jsx', javascript);
SyntaxHighlighter.registerLanguage('tsx', typescript);

// 工具函数：类名合并
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// 移除重复的组件定义，使用导入的组件

// 检测主题的 hook
const useTheme = () => {
  const [isDark, setIsDark] = useState(false);

  React.useEffect(() => {
    const checkTheme = () => {
      // 检查系统主题偏好
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      setIsDark(prefersDark);
    };

    checkTheme();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);

    return () => mediaQuery.removeEventListener('change', checkTheme);
  }, []);

  return isDark;
};

interface MarkdownRendererProps {
  source: string;
  style?: React.CSSProperties;
  className?: string;
}

// 移除重复的CustomContainer定义，使用导入的组件

// 移除重复的preprocessCustomContainers函数定义，使用导入的函数

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  source,
  style,
  className,
}) => {
  const isDark = useTheme();

  // 预处理源码
  const processedSource = preprocessCustomContainers(source);
  return (
    <div className={cn('prose prose-lg max-w-none', className)} style={style}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // 标题组件
          h1: ({ children, ...props }) => (
            <h1 className="heading-1" {...props}>
              {children}
              <div className="heading-underline"></div>
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="heading-2" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="heading-3" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="heading-4" {...props}>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className="heading-5" {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 className="heading-6" {...props}>
              {children}
            </h6>
          ),
          // 段落 - 优化文本展示，处理图片容器
          p: ({ children, ...props }) => {
            // 检查是否只包含图片
            const hasOnlyImage =
              React.Children.count(children) === 1 &&
              React.Children.toArray(children).every(
                (child) => React.isValidElement(child) && child.type === 'img',
              );

            if (hasOnlyImage) {
              // 如果段落只包含图片，使用div容器
              return <div className="image-container">{children}</div>;
            }

            return (
              <p className="paragraph" {...props}>
                {children}
              </p>
            );
          },
          // 引用块
          blockquote: ({ children, ...props }) => (
            <blockquote className="blockquote" {...props}>
              <div className="blockquote-content">{children}</div>
            </blockquote>
          ),
          // 列表
          ul: ({ children, ...props }) => (
            <ul className="list-unordered" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-ordered" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="list-item" {...props}>
              <span className="list-item-content">{children}</span>
            </li>
          ),
          // 链接
          a: ({ children, href, ...props }) => (
            <a href={href} className="link" {...props}>
              {children}
            </a>
          ),
          // 表格
          table: ({ children, ...props }) => (
            <div className="table-wrapper">
              <table className="table" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="table-head" {...props}>
              {children}
            </thead>
          ),
          th: ({ children, ...props }) => (
            <th className="table-header" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="table-cell" {...props}>
              {children}
            </td>
          ),
          // 水平线
          hr: ({ ...props }) => (
            <div className="divider" {...props}>
              <div className="divider-line"></div>
              <div className="divider-symbol">✦</div>
              <div className="divider-line"></div>
            </div>
          ),
          // 图片 - 避免HTML嵌套问题
          img: ({ src, alt, ...props }) => (
            <img src={src} alt={alt} className="image" {...props} />
          ),
          // 代码块和内联代码
          code({
            node,
            className,
            children,
            ...props
          }: ComponentPropsWithoutRef<'code'> & { node?: any }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'text';
            const codeContent = String(children).replace(/\n$/, '');
            // 代码块（有语言标识，如 ```javascript）
            const inline = !className?.startsWith('language-');
            // 内联代码
            if (inline) {
              return (
                <code className="inline-code" {...props}>
                  {children}
                </code>
              );
            }

            // 代码块
            return (
              <div className="code-block">
                {/* 代码块头部 */}
                <div className="code-header">
                  <div className="code-controls">
                    <div className="code-dots">
                      <div className="dot dot-red"></div>
                      <div className="dot dot-yellow"></div>
                      <div className="dot dot-green"></div>
                    </div>
                    <span className="code-language">{language}</span>
                  </div>
                  <CodeCopyButton code={codeContent} />
                </div>
                {/* 代码内容 */}
                <div className="code-content">
                  <SyntaxHighlighter
                    language={language}
                    style={isDark ? atomOneDark : atomOneLight}
                    showLineNumbers={true}
                    useInlineStyles={false}
                    customStyle={{
                      margin: 0,
                      padding: '1.5rem',
                      background: 'transparent',
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                      borderRadius: 0,
                    }}
                    lineNumberStyle={{
                      minWidth: '3em',
                      paddingRight: '1em',
                      color: 'var(--text-muted)',
                      textAlign: 'right',
                      userSelect: 'none',
                    }}
                    className="syntax-highlighter"
                  >
                    {codeContent}
                  </SyntaxHighlighter>
                </div>
              </div>
            );
          },
          // 处理自定义容器指令
          div: ({
            className,
            children,
            node,
            ...props
          }: React.ClassAttributes<HTMLDivElement> &
            React.HTMLAttributes<HTMLDivElement> &
            ExtraProps & {
              'data-title'?: string;
            }) => {
            if (className && className.includes('custom-container')) {
              const typeMatch = className.match(/custom-container-([\w-]+)/);
              if (typeMatch) {
                const type = typeMatch[1];
                const title = (props['data-title'] as string) || undefined;

                // 如果是iframe容器，直接渲染内容
                if (type === 'iframe') {
                  return <div className="iframe-container">{children}</div>;
                }

                return (
                  <CustomContainerComponent type={type} title={title}>
                    {children}
                  </CustomContainerComponent>
                );
              }
            }
            return (
              <div className={className} {...props}>
                {children}
              </div>
            );
          },
        }}
      >
        {processedSource}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;