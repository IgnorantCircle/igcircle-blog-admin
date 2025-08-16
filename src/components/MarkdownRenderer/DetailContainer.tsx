import React from 'react'
import { Collapse } from 'antd'

interface DetailContainerProps {
	title?: string
	children: React.ReactNode
}

const DetailContainer: React.FC<DetailContainerProps> = ({ title, children }) => {
	const items = [
		{
			key: '1',
			label: title || '展开查看内容',
			children: children
		}
	]

	return (
		<Collapse items={items} style={{ margin: '20px 0' }} />
	)
}

export default DetailContainer