import React, { useState } from 'react';
import { Button, message } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './CodeBlock.less';

interface CodeBlockProps {
  children: string;
  className?: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, className, language }) => {
  const [copied, setCopied] = useState(false);
  
  // 从className中提取语言信息
  const lang = language || (className ? className.replace('language-', '') : 'text');
  
  // 复制代码到剪贴板
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      message.success('代码已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      message.error('复制失败');
    }
  };

  // 获取主题样式
  const getTheme = () => {
    // 检查是否为暗色主题
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return tomorrow;
    }
    return prism;
  };

  return (
    <div className="code-block-container">
      {/* 代码块头部 */}
      <div className="code-block-header">
        <span className="code-block-language">{lang.toUpperCase()}</span>
        <Button
          type="text"
          size="small"
          icon={copied ? <CheckOutlined /> : <CopyOutlined />}
          onClick={handleCopy}
          className="code-block-copy-btn"
        >
          {copied ? '已复制' : '复制'}
        </Button>
      </div>
      
      {/* 代码内容 */}
      <SyntaxHighlighter
        language={lang}
        style={getTheme()}
        showLineNumbers={true}
        lineNumberStyle={{
          minWidth: '3em',
          paddingRight: '1em',
          textAlign: 'right',
          userSelect: 'none',
          opacity: 0.5,
        }}
        customStyle={{
          margin: 0,
          borderRadius: '0 0 8px 8px',
          fontSize: '14px',
          lineHeight: '1.5',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
          },
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;