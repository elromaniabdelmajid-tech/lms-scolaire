interface ResourceListProps {
  resources: {
    id: string
    title: string
    type: string
    url: string
  }[]
}

const TYPE_ICONS: Record<string, string> = {
  VIDEO: '🎬',
  PDF: '📄',
  DOC: '📝',
  LINK: '🔗',
  IMAGE: '🖼️'
}

const TYPE_LABELS: Record<string, string> = {
  VIDEO: 'Vidéo',
  PDF: 'PDF',
  DOC: 'Document',
  LINK: 'Lien',
  IMAGE: 'Image'
}

export function ResourceList({ resources }: ResourceListProps) {
  return (
    <div className="space-y-3">
      {resources.map((resource) => (
        <a
          key={resource.id}
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition group"
        >
          <span className="text-2xl">{TYPE_ICONS[resource.type] || '📎'}</span>
          <div className="flex-1">
            <p className="font-medium group-hover:text-indigo-600 transition">
              {resource.title}
            </p>
            <p className="text-sm text-gray-500">
              {TYPE_LABELS[resource.type] || resource.type}
            </p>
          </div>
          <span className="text-gray-400 group-hover:text-indigo-600">
            🔗
          </span>
        </a>
      ))}
    </div>
  )
}