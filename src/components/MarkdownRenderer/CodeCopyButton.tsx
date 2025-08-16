import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CodeCopyButtonProps {
	code: string
}

const CodeCopyButton: React.FC<CodeCopyButtonProps> = ({ code }) => {
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (err) {
			console.error('Failed to copy code:', err)
			// 降级方案
			const textArea = document.createElement('textarea')
			textArea.value = code
			document.body.appendChild(textArea)
			textArea.select()
			try {
				document.execCommand('copy')
				setCopied(true)
				setTimeout(() => setCopied(false), 2000)
			} catch (fallbackErr) {
				console.error('Fallback copy failed:', fallbackErr)
			} finally {
				document.body.removeChild(textArea)
			}
		}
	}

	return (
		<button
			aria-label={copied ? 'Copied!' : 'Copy code'}
			className="copy-button"
			onClick={handleCopy}
			title={copied ? '已复制!' : '复制代码'}
		>
			{copied ? <Check size={16} /> : <Copy size={16} />}
		</button>
	)
}

export default CodeCopyButton