import type {
  SecurityCategoryBreakdown,
  SecurityChecklistItem,
} from '@/types';

export const SECURITY_STATUS_POINTS: Record<
  SecurityChecklistItem['status'],
  number
> = {
  compliant: 2,
  partial: 1,
  'non-compliant': 0,
};

export const SECURITY_CHECKLIST_TEMPLATES = [
  {
    category: 'Identity & Access Management (IAM)',
    items: [
      {
        item: 'Multi-factor authentication is enforced for privileged accounts.',
        recommendation:
          'Enforce MFA for administrators and remote access entry points.',
      },
      {
        item: 'User access is provisioned using least-privilege policies.',
        recommendation:
          'Review roles and reduce permissions to minimum operational access.',
      },
      {
        item: 'Dormant or orphaned accounts are regularly reviewed and removed.',
        recommendation:
          'Schedule periodic identity recertification and disable inactive accounts.',
      },
      {
        item: 'Privileged access is separated from standard user activity.',
        recommendation:
          'Use dedicated privileged accounts and just-in-time elevation for admins.',
      },
      {
        item: 'Single sign-on is enabled for core cloud applications.',
        recommendation:
          'Centralize identity with SSO to improve access control and auditability.',
      },
      {
        item: 'Access logs are retained and reviewed for suspicious activity.',
        recommendation:
          'Enable identity audit logging and review anomalies through a SIEM workflow.',
      },
    ],
  },
  {
    category: 'Data Encryption & Privacy',
    items: [
      {
        item: 'Sensitive data is encrypted at rest across cloud storage services.',
        recommendation:
          'Enable encryption at rest and verify coverage for all sensitive datasets.',
      },
      {
        item: 'Sensitive data is encrypted in transit using modern TLS settings.',
        recommendation:
          'Require TLS for all external and internal service communication paths.',
      },
      {
        item: 'Encryption keys are centrally managed and rotated on schedule.',
        recommendation:
          'Use managed KMS controls with defined rotation and ownership policies.',
      },
      {
        item: 'Personal or regulated data is classified and handled by policy.',
        recommendation:
          'Implement data classification labels and apply handling requirements.',
      },
      {
        item: 'Backups containing sensitive data are encrypted and access-controlled.',
        recommendation:
          'Encrypt backup media and restrict restore operations to approved personnel.',
      },
      {
        item: 'Data retention and deletion practices align with privacy obligations.',
        recommendation:
          'Define retention schedules and automate secure deletion for expired data.',
      },
    ],
  },
  {
    category: 'Network Security',
    items: [
      {
        item: 'Production workloads are segmented from public-facing resources.',
        recommendation:
          'Implement network segmentation between internet, app, and data tiers.',
      },
      {
        item: 'Firewall and security group rules are reviewed regularly.',
        recommendation:
          'Audit ingress and egress rules and remove broad or unused access.',
      },
      {
        item: 'Critical services are protected with web application or edge controls.',
        recommendation:
          'Deploy WAF, DDoS, or edge protection for exposed applications.',
      },
      {
        item: 'Administrative access is restricted through secure private channels.',
        recommendation:
          'Move administration behind VPN, bastion, or zero-trust access controls.',
      },
      {
        item: 'Intrusion detection or threat monitoring is enabled for core systems.',
        recommendation:
          'Enable managed threat detection and route alerts into incident workflows.',
      },
      {
        item: 'Vulnerability scans are performed for internet-exposed assets.',
        recommendation:
          'Schedule scanning for exposed assets and track remediation timelines.',
      },
    ],
  },
  {
    category: 'Compliance & Regulatory',
    items: [
      {
        item: 'Applicable regulatory requirements are documented for cloud workloads.',
        recommendation:
          'Map workloads to relevant regulations and assign control owners.',
      },
      {
        item: 'Control evidence is maintained for audits and internal reviews.',
        recommendation:
          'Collect and store compliance evidence in a repeatable review process.',
      },
      {
        item: 'Third-party vendors are assessed for security and compliance impact.',
        recommendation:
          'Add vendor risk reviews for cloud providers and supporting tools.',
      },
      {
        item: 'Policies for acceptable use, access, and data handling are current.',
        recommendation:
          'Refresh security policies and communicate them to affected teams.',
      },
      {
        item: 'Security awareness training covers regulatory obligations.',
        recommendation:
          'Include compliance scenarios in annual training and onboarding.',
      },
      {
        item: 'Exceptions and risk acceptances are formally documented.',
        recommendation:
          'Track control exceptions with approvals, expiry dates, and mitigation plans.',
      },
    ],
  },
  {
    category: 'Incident Response & Recovery',
    items: [
      {
        item: 'An incident response plan exists for cloud security events.',
        recommendation:
          'Document incident playbooks for credential misuse, data loss, and service compromise.',
      },
      {
        item: 'Security incidents are escalated through defined roles and contacts.',
        recommendation:
          'Define escalation contacts, severities, and communication channels.',
      },
      {
        item: 'Backups and recovery procedures are tested on a regular schedule.',
        recommendation:
          'Run restore exercises and record recovery time and integrity outcomes.',
      },
      {
        item: 'Critical logs are preserved for forensic investigation.',
        recommendation:
          'Retain tamper-resistant logs long enough to support investigations.',
      },
      {
        item: 'The organization conducts tabletop or simulation exercises.',
        recommendation:
          'Run incident simulations to validate response readiness and ownership.',
      },
      {
        item: 'Post-incident reviews capture lessons learned and remediation actions.',
        recommendation:
          'Require post-incident reviews with tracked corrective actions.',
      },
    ],
  },
] as const;

export function buildDefaultSecurityChecklist(): SecurityChecklistItem[] {
  return SECURITY_CHECKLIST_TEMPLATES.flatMap((category) =>
    category.items.map((entry) => ({
      category: category.category,
      item: entry.item,
      status: 'partial' as const,
      notes: '',
    })),
  );
}

export function getSecurityRiskLevel(score: number) {
  if (score >= 50) {
    return {
      level: 'low' as const,
      label: 'Low Risk',
      badgeClassName:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    };
  }

  if (score >= 35) {
    return {
      level: 'medium' as const,
      label: 'Medium Risk',
      badgeClassName:
        'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    };
  }

  if (score >= 20) {
    return {
      level: 'high' as const,
      label: 'High Risk',
      badgeClassName:
        'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    };
  }

  return {
    level: 'critical' as const,
    label: 'Critical Risk',
    badgeClassName:
      'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  };
}

export function calculateSecurityScore(checklist: SecurityChecklistItem[]) {
  return checklist.reduce(
    (total, item) => total + SECURITY_STATUS_POINTS[item.status],
    0,
  );
}

export function getSecurityCategoryBreakdown(
  checklist: SecurityChecklistItem[],
): SecurityCategoryBreakdown[] {
  return SECURITY_CHECKLIST_TEMPLATES.map((categoryTemplate) => {
    const items = checklist.filter(
      (entry) => entry.category === categoryTemplate.category,
    );

    return {
      category: categoryTemplate.category,
      score: items.reduce(
        (total, item) => total + SECURITY_STATUS_POINTS[item.status],
        0,
      ),
      maxScore: categoryTemplate.items.length * 2,
      compliantCount: items.filter((item) => item.status === 'compliant').length,
      partialCount: items.filter((item) => item.status === 'partial').length,
      nonCompliantCount: items.filter((item) => item.status === 'non-compliant')
        .length,
    };
  });
}

export function generateSecurityRecommendations(
  checklist: SecurityChecklistItem[],
) {
  const recommendations = checklist
    .filter((item) => item.status !== 'compliant')
    .map((item) => {
      const category = SECURITY_CHECKLIST_TEMPLATES.find(
        (entry) => entry.category === item.category,
      );
      const template = category?.items.find((entry) => entry.item === item.item);

      return template?.recommendation ?? `Address control gap: ${item.item}`;
    });

  return Array.from(new Set(recommendations));
}

export function generateSecurityFindings(checklist: SecurityChecklistItem[]) {
  const findings = checklist
    .filter((item) => item.status !== 'compliant')
    .map((item) => {
      const severity = item.status === 'non-compliant' ? 'Critical gap' : 'Gap';
      const note = item.notes.trim() ? ` Notes: ${item.notes.trim()}` : '';
      return `${severity} in ${item.category}: ${item.item}.${note}`;
    });

  return findings;
}

export function generateSecurityActionItems(checklist: SecurityChecklistItem[]) {
  return checklist
    .filter((item) => item.status === 'non-compliant')
    .map((item) => {
      const category = SECURITY_CHECKLIST_TEMPLATES.find(
        (entry) => entry.category === item.category,
      );
      const template = category?.items.find((entry) => entry.item === item.item);

      return template?.recommendation ?? `Remediate non-compliant control: ${item.item}`;
    });
}
