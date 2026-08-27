import { useNavigate } from 'react-router-dom'
import BuybackCard, { type BuybackCardProps } from './BuybackCard'
import avatarClient from '../assets/quote-module/avatar-client.png'
import avatarAssignee1 from '../assets/quote-module/avatar-assignee-1.png'
import avatarAssignee2 from '../assets/quote-module/avatar-assignee-2.png'
import avatarAssignee3 from '../assets/quote-module/avatar-assignee-3.png'

type BuybackRow = BuybackCardProps & { id: string }

// Sample data — the Figma design shows this card pattern repeated indefinitely
// down a scrollable list. 5 rows are enough to demonstrate the repeating
// pattern (varied flags/data) without hardcoding dozens of near-duplicates.
// `id` is the route param used to link each row to /quotes/:id.
const SAMPLE_ROWS: BuybackRow[] = [
  {
    id: 'BB-9817-1',
    flags: ['colombia', 'mexico', 'argentina'],
    quoteCode: 'BB° 9817',
    client: 'Zeplin, Inc.',
    clientAvatar: avatarClient,
    requestedBy: 'Carlos Méndez',
    toolsQuoted: 46,
    toolsChecked: 12,
    createdAt: '12/03/2026',
    elapsedLabel: '2 hrs',
    assignees: [avatarAssignee1, avatarAssignee2, avatarAssignee3],
  },
  {
    id: 'BB-9817-2',
    flags: ['mexico'],
    quoteCode: 'BB° 9817',
    client: 'Zeplin, Inc.',
    clientAvatar: avatarClient,
    requestedBy: 'Ana García',
    toolsQuoted: 7,
    toolsChecked: 4,
    createdAt: '12/03/2026',
    elapsedLabel: '2 hrs',
    assignees: [avatarAssignee1, avatarAssignee2, avatarAssignee3],
  },
  {
    id: 'BB-9817-3',
    flags: ['turkey', 'venezuela'],
    quoteCode: 'BB° 9817',
    client: 'Zeplin, Inc.',
    clientAvatar: avatarClient,
    requestedBy: 'Roberto Silva',
    toolsQuoted: 20,
    toolsChecked: 10,
    createdAt: '12/03/2026',
    elapsedLabel: '2 hrs',
    assignees: [avatarAssignee1, avatarAssignee2, avatarAssignee3],
  },
  {
    id: 'BB-9817-4',
    flags: ['mexico'],
    quoteCode: 'BB° 9817',
    client: 'Zeplin, Inc.',
    clientAvatar: avatarClient,
    requestedBy: 'María López',
    toolsQuoted: 26,
    toolsChecked: 7,
    createdAt: '12/03/2026',
    elapsedLabel: '2 hrs',
    assignees: [avatarAssignee1, avatarAssignee2, avatarAssignee3],
  },
  {
    id: 'BB-9817-5',
    flags: ['colombia', 'argentina', 'venezuela'],
    quoteCode: 'BB° 9817',
    client: 'Zeplin, Inc.',
    clientAvatar: avatarClient,
    requestedBy: 'Lucía Fernández',
    toolsQuoted: 43,
    toolsChecked: 11,
    createdAt: '12/03/2026',
    elapsedLabel: '2 hrs',
    assignees: [avatarAssignee1, avatarAssignee2, avatarAssignee3],
  },
]

export default function BuybackTable() {
  const navigate = useNavigate()

  return (
    <div className="flex w-full flex-col items-start gap-[12px]">
      {SAMPLE_ROWS.map(({ id, ...row }) => (
        <BuybackCard key={id} {...row} onRowClick={() => navigate(`/quotes/${id}`)} />
      ))}
    </div>
  )
}
