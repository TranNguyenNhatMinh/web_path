import '../css/Footer.css'

type Props = {
  tools?: string[]
}

export function Footer({
  tools = [
    'React + TypeScript',
    'Vite',
    'TanStack Router',
    'NestJS',
    'MongoDB (Mongoose)',
    'JWT (Access/Refresh)',
    'Axios',
  ],
}: Props) {
  return (
    <footer className="appFooter">
      <div className="appFooter__inner">
        <p className="appFooter__title">Công cụ đang sử dụng</p>
        <ul className="appFooter__tools">
          {tools.map((t) => (
            <li key={t} className="appFooter__tool">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}

