import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import {
  FileText, MessageSquare, Users,
} from '../../lib/icons'

type HubTab = 'templates' | 'posts' | 'referrals'

export function CommunityHubPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<HubTab>('templates')

  return (
    <AppLayout>
      <div className="mb-xl">
        <h1 className="text-headline-lg text-on-surface font-semibold">Community Hub</h1>
        <p className="text-body-md text-on-surface-variant">Shared resources and discussions</p>
      </div>

      <div className="flex gap-1 mb-xl border-b border-outline-variant">
        {([
          ['templates', 'Templates', FileText],
          ['posts', 'Posts', MessageSquare],
          ['referrals', 'Referrals', Users],
        ] as [HubTab, string, typeof FileText][]).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-label-sm font-medium transition-colors ${
              activeTab === id ? 'bg-primary/5 text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {[
            { title: 'Software Engineer Resume', type: 'Resume Template', desc: 'ATS-optimized template for SWE roles' },
            { title: 'Cover Letter - Standard', type: 'Cover Letter', desc: 'Professional cover letter template' },
            { title: 'Thank You Note', type: 'Email Template', desc: 'Post-interview thank you email' },
          ].map((t, i) => (
            <Card key={i} className="hover:border-primary/50 transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-label-xs text-on-surface-variant">{t.type}</span>
              </div>
              <h3 className="text-headline-sm text-on-surface font-semibold mb-1">{t.title}</h3>
              <p className="text-body-sm text-on-surface-variant">{t.desc}</p>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'posts' && (
        <Card>
          <div className="py-10 text-center">
            <MessageSquare className="w-10 h-10 text-on-surface-variant mx-auto mb-3 opacity-50" />
            <h3 className="text-headline-md text-on-surface mb-1">Community Discussions</h3>
            <p className="text-body-md text-on-surface-variant">Discuss strategies, share insights, and connect with peers</p>
          </div>
        </Card>
      )}

      {activeTab === 'referrals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <Card className="hover:border-primary/50 transition-all duration-200 cursor-pointer" onClick={() => navigate('/community/opportunities')}>
            <Users className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-headline-sm text-on-surface font-semibold mb-1">Request Referral</h3>
            <p className="text-body-md text-on-surface-variant">Ask the community for a referral to a specific opportunity</p>
          </Card>
          <Card className="hover:border-primary/50 transition-all duration-200 cursor-pointer" onClick={() => navigate('/community/opportunities')}>
            <Users className="w-8 h-8 text-amber-600 mb-3" />
            <h3 className="text-headline-sm text-on-surface font-semibold mb-1">Offer Referral</h3>
            <p className="text-body-md text-on-surface-variant">Help others by offering referrals at your company</p>
          </Card>
        </div>
      )}
    </AppLayout>
  )
}
