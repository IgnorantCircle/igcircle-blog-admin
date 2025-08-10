import React from 'react';
import ReactDOM from 'react-dom/client';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import CodeBlock from './CodeBlock';
import './styles.less';

interface MarkdownRendererProps {
  source: string;
  style?: React.CSSProperties;
  className?: string;
}

// 自定义容器插件
function remarkCustomContainers() {
  const containerTypes = {
    tip: { icon: '💡', title: '提示' },
    warning: { icon: '⚠️', title: '警告' },
    danger: { icon: '🚨', title: '危险' },
    info: { icon: 'ℹ️', title: '信息' },
    note: { icon: '📝', title: '注意' },
    success: { icon: '✅', title: '成功' },
    error: { icon: '❌', title: '错误' },
  };

  return (tree: any) => {
    visit(tree, (node: any) => {
      console.log('Visiting node type:', node.type, 'name:', node.name);
      
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        console.log('Found directive:', {
          type: node.type,
          name: node.name,
          attributes: node.attributes,
          children: node.children?.length
        });
        
        if (node.type === 'containerDirective' && containerTypes[node.name as keyof typeof containerTypes]) {
          const container = containerTypes[node.name as keyof typeof containerTypes];
          const customTitle = node.attributes?.title;
          const title = customTitle || container.title;
          
          console.log('Processing container:', {
            type: node.name,
            customTitle,
            finalTitle: title,
            attributes: node.attributes
          });

          // 设置 hast 数据
          const data = node.data || (node.data = {});
          data.hName = 'div';
          data.hProperties = {
            className: [`custom-container`, `custom-container-${node.name}`],
          };

          // 创建标题节点
          const titleNode = {
            type: 'paragraph',
            data: {
              hName: 'div',
              hProperties: {
                className: 'custom-container-title',
              },
            },
            children: [
              {
                type: 'text',
                value: `${container.icon} ${title}`,
              },
            ],
          };

          // 创建内容容器
          const contentWrapper = {
            type: 'paragraph',
            data: {
              hName: 'div',
              hProperties: {
                className: 'custom-container-content',
              },
            },
            children: node.children || [],
          };

          // 替换子节点
          node.children = [titleNode, contentWrapper];
        }
      }
    });
  };
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  source,
  style,
  className,
}) => {
  const [htmlContent, setHtmlContent] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const processMarkdown = async () => {
      try {
        setLoading(true);
        console.log('Creating processor with source:', source.substring(0, 100));
         
         const result = await unified()
           .use(remarkParse)
           .use(remarkGfm)
           .use(remarkDirective)
           .use(remarkCustomContainers)
           .use(remarkRehype, { allowDangerousHtml: true })
           .use(rehypeRaw)
           .use(rehypeSanitize, {
             ...defaultSchema,
             attributes: {
               ...defaultSchema.attributes,
               div: [...((defaultSchema.attributes && defaultSchema.attributes.div) || []), 'className', 'data-language'],
               pre: [...((defaultSchema.attributes && defaultSchema.attributes.pre) || []), 'className', 'data-language'],
               code: [...((defaultSchema.attributes && defaultSchema.attributes.code) || []), 'className', 'data-language'],
               span: [...((defaultSchema.attributes && defaultSchema.attributes.span) || []), 'className'],
             },
           })
           .use(rehypeStringify)
           .process(source);
        

        
        setHtmlContent(String(result));
      } catch (error) {
        console.error('Markdown processing error:', error);
        setHtmlContent('<p>Markdown 渲染出错</p>');
      } finally {
        setLoading(false);
      }
    };

    if (source) {
      processMarkdown();
    } else {
      setHtmlContent('');
      setLoading(false);
    }
  }, [source]);

  // 处理代码块的useEffect
  React.useEffect(() => {
    if (!loading && htmlContent && containerRef.current) {
      const container = containerRef.current;
      const codeBlocks = container.querySelectorAll('pre code');
      
      codeBlocks.forEach((codeElement) => {
        const preElement = codeElement.parentElement;
        if (preElement && !preElement.querySelector('.code-block-container')) {
          const className = codeElement.className;
          const language = className.replace('language-', '') || 'text';
          const code = codeElement.textContent || '';
          
          // 创建一个新的div来包装我们的React组件
          const wrapperDiv = document.createElement('div');
          
          // 使用React 18的createRoot API
          const root = ReactDOM.createRoot(wrapperDiv);
          root.render(
            React.createElement(CodeBlock, {
              children: code,
              language: language,
              className: className
            })
          );
          
          // 替换原来的pre元素
          if (preElement.parentNode) {
            preElement.parentNode.replaceChild(wrapperDiv, preElement);
          }
        }
      });
    }
  }, [htmlContent, loading]);

  if (loading) {
    return <div className="markdown-loading">加载中...</div>;
  }



  return (
    <div
      ref={containerRef}
      className={`markdown-renderer ${className || ''}`}
      style={{
        lineHeight: '1.8',
        fontSize: '16px',
        color: '#333',
        backgroundColor: 'transparent',
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownRenderer;