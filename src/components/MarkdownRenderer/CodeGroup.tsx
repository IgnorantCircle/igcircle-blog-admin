import React, { useMemo } from 'react'
import { Tabs } from 'antd'

interface CodeGroupProps {
	title?: string
	children: React.ReactNode
}

const CodeGroup: React.FC<CodeGroupProps> = ({ title, children }) => {
	// 解析子元素中的代码块和标题
	const codeBlocks = useMemo(() => {
		const childArray = React.Children.toArray(children)
		
		const preElements = childArray.filter((child) => {
			const isPreElement = React.isValidElement(child) && child.type === 'pre'
			return isPreElement
		})
		
		return preElements.map((child, index) => {
			if (React.isValidElement(child)) {
				// 从 pre 元素中提取 code 元素
				const codeElement = (child.props as { children?: React.ReactNode }).children
				
				if (React.isValidElement(codeElement)) {
					// 尝试从 code 元素的 props 中提取标题和语言
					const codeProps = codeElement.props as { 
						className?: string
						'data-title'?: string
						title?: string
						children?: React.ReactNode
					}
					
					// 获取语言信息
					let language = 'text'
					if (codeProps.className) {
						const langMatch = codeProps.className.match(/language-(\w+)/)
						if (langMatch) {
							language = langMatch[1]
						}
					}	
					// 获取标题
					let title = codeProps['data-title'] || codeProps.title
					
					// 如果没有标题，尝试从代码内容中提取标题
					if (!title && typeof codeProps.children === 'string') {
						// 首先尝试提取 <!-- BLOCK_TITLE: xxx --> 格式的标题
						const blockTitleMatch = codeProps.children.match(/<!--\s*BLOCK_TITLE:\s*([^\s][^>]*?)\s*-->/)
						if (blockTitleMatch) {
							title = blockTitleMatch[1].trim()
						} else {
							// 然后尝试提取 [title] 格式的标题
							const titleMatch = codeProps.children.match(/\[([^\]]+)\]/)
							if (titleMatch) {
								title = titleMatch[1]
							}
						}
					}
					
					// 如果还是没有标题，使用语言名
					if (!title) {
						title = language
					}
					
					return { element: child, title, language }
				}
			}
			return { element: child, title: `代码块 ${index + 1}`, language: 'text' }
		})
	}, [children])
	
	if (codeBlocks.length === 0) {
		return (
			<div className="code-group-empty">
				未找到代码块
			</div>
		)
	}
	
	if (codeBlocks.length === 1) {
		// 如果只有一个代码块，直接显示，不需要标签页
		return (
			<div className="code-group code-group-single">
				{title && (
					<div className="code-group-title">
						{title}
					</div>
				)}
				{codeBlocks[0].element}
			</div>
		)
	}

	const tabItems = codeBlocks.map((block, index) => ({
		key: index.toString(),
		label: block.title,
		children: block.element,
	}))
	
	return (
		<div className="code-group code-group-multiple">
			{title && (
				<div className="code-group-title">
					{title}
				</div>
			)}
			<Tabs
				defaultActiveKey="0"
				items={tabItems}
				size="small"
				type="card"
			/>
		</div>
	)
}

export default CodeGroup