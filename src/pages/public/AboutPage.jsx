import React from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { ShieldCheck, BookOpen, Sparkles, Code2, Users, MapPin } from 'lucide-react';
import { INSTITUTION_NAME, APP_TAGLINE } from '../../utils/constants';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Badge variant="primary" size="md">
          Academic Technopreneurship Project
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-heading">
          About NavPC Market
        </h1>
        <p className="text-base text-brand-blue font-medium">
          {APP_TAGLINE}
        </p>
        <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
          A proposed technology-based marketplace engineered to serve the student community of {INSTITUTION_NAME} (NPC), fostering digital commerce and student-led micro-enterprises.
        </p>
      </div>

      {/* Grid of Key Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card padding={true}>
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 text-brand-blue rounded-xl shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-content-heading">Academic Purpose</h3>
              <p className="text-xs text-content-muted leading-relaxed">
                NavPC Market is designed as an academic requirement for the <strong>Technopreneurship</strong> course. It applies lean business model innovation, customer problem discovery, and scalable full-stack web engineering.
              </p>
            </div>
          </div>
        </Card>

        <Card padding={true}>
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-50 text-status-success rounded-xl shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-content-heading">Student Entrepreneurship</h3>
              <p className="text-xs text-content-muted leading-relaxed">
                Provides NPC students with a zero-barrier digital storefront to sell course textbooks, uniforms, baked treats, electronics, and digital services such as printing, layout, and tutoring.
              </p>
            </div>
          </div>
        </Card>

        <Card padding={true}>
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-content-heading">Safety & Designated Meetups</h3>
              <p className="text-xs text-content-muted leading-relaxed">
                Transactions are conducted through designated safe zones on campus — including the NPC Main Building Lobby, Student Activity Center, and Library Entrance.
              </p>
            </div>
          </div>
        </Card>

        <Card padding={true}>
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-50 text-status-warning rounded-xl shrink-0">
              <Code2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-content-heading">Modern Technology Stack</h3>
              <p className="text-xs text-content-muted leading-relaxed">
                Built with React, Vite, Tailwind CSS, Supabase PostgreSQL with Row-Level Security (RLS), Lucide React, and Recharts analytics.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Compliance Disclaimer */}
      <div className="p-5 bg-white border border-surface-border rounded-xl text-xs space-y-2">
        <h4 className="font-bold text-content-heading">Institutional Disclaimer</h4>
        <p className="text-content-muted leading-relaxed">
          NavPC Market is an independent student academic proposal and is not an official administrative office of Navotas Polytechnic College. The project does not claim official institutional endorsement or use the official college seal without authorization.
        </p>
      </div>
    </div>
  );
}
