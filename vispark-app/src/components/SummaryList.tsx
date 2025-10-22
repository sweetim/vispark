import type { FC } from "react"

type SummaryListProps = {
  items: string[]
}

const SummaryList: FC<SummaryListProps> = ({ items }) => {
  if (!items.length) {
    return null
  }

  return (
    <div>
      <ul className="list-disc list-inside text-sm leading-relaxed bg-gray-800 border border-gray-700 rounded-md p-4">
        {items.map((item, index) => (
          <li
            key={`${index}-${item.slice(0, 16)}`}
            className="mb-1"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SummaryList
